/**
 * POST /api/round
 * Mở hoặc đóng một vòng bỏ phiếu (chỉ host gọi):
 * { room, host, action: "open" | "close", turnId?, question?, seconds? }
 * Mở vòng mới thì round tự tăng 1 và xoá phiếu cũ của vòng đó. `seconds` (10–300) đặt giờ hết hạn bỏ phiếu.
 * Đóng vòng thì đếm phiếu, lưu vào `result` và trả về `counts`.
 * Sai token trả 401. Không cache.
 */

import type { ApiRequest, ApiResponse } from "./_lib.js";
import { ConfigError, hostTokenFrom, parseRequestBody, sendJson } from "./_lib.js";
import { clearRoomVotes, countVotes, getRoomState, getRoomVotes, setRoomState, verifyHostToken, type RoomState } from "./_redis.js";

const MIN_SECONDS = 10;
const MAX_SECONDS = 300;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const body = await parseRequestBody(req);
    const { room, host, action, turnId, question, seconds } = body;

    if (!room || typeof room !== "string") {
      sendJson(res, 400, { ok: false, error: "Thiếu hoặc sai mã phòng" });
      return;
    }

    if (!verifyHostToken(hostTokenFrom(req, host))) {
      sendJson(res, 401, { ok: false, error: "Mã xác thực host không hợp lệ" });
      return;
    }

    if (action !== "open" && action !== "close") {
      sendJson(res, 400, { ok: false, error: "Hành động không hợp lệ (phải là open hoặc close)" });
      return;
    }

    const currentState = await getRoomState(room);

    if (action === "open") {
      const nextRound = (currentState.round || 0) + 1;

      // Xoá phiếu cũ của vòng mới nếu có
      await clearRoomVotes(room, nextRound);

      const now = Date.now();
      const newState: RoomState = {
        round: nextRound,
        open: true,
        turnId: typeof turnId === "string" ? turnId : "",
        question: typeof question === "string" ? question : "",
        options: ["CHO_QUA", "GIU_LAI"],
        openedAt: now,
      };
      if (typeof seconds === "number" && Number.isFinite(seconds)) {
        newState.endsAt = now + Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.round(seconds))) * 1000;
      }

      await setRoomState(room, newState);

      sendJson(
        res,
        200,
        {
          ok: true,
          round: nextRound,
          open: true,
          turnId: newState.turnId,
          endsAt: newState.endsAt,
        },
        { "Cache-Control": "no-store" },
      );
      return;
    }

    // action === "close"
    if (currentState.round === 0) {
      sendJson(res, 200, { ok: true, round: 0, open: false }, { "Cache-Control": "no-store" });
      return;
    }

    // Đóng lại lần nữa thì giữ nguyên kết quả đã chốt, không đếm lại.
    const counts = currentState.open || !currentState.result
      ? countVotes(await getRoomVotes(room, currentState.round))
      : currentState.result;
    const closedState: RoomState = {
      ...currentState,
      open: false,
      result: counts,
    };

    await setRoomState(room, closedState);

    sendJson(
      res,
      200,
      {
        ok: true,
        round: closedState.round,
        open: false,
        turnId: closedState.turnId,
        counts,
        total: counts.CHO_QUA + counts.GIU_LAI,
      },
      { "Cache-Control": "no-store" },
    );
  } catch (error) {
    if (error instanceof ConfigError) {
      sendJson(res, 503, { ok: false, error: error.message }, { "Cache-Control": "no-store" });
      return;
    }
    sendJson(res, 500, { ok: false, error: "Đã xảy ra lỗi máy chủ khi điều khiển vòng bỏ phiếu" });
  }
}
