/**
 * POST /api/round
 * Mở hoặc đóng một vòng bỏ phiếu (chỉ host gọi):
 * { room, host, action: "open" | "close", turnId?, question? }
 * Mở vòng mới thì round tự tăng 1 và xoá phiếu cũ của vòng đó.
 * Sai token trả 401. Không cache.
 */

import type { ApiRequest, ApiResponse } from "./_lib";
import { parseRequestBody, sendJson } from "./_lib";
import { clearRoomVotes, getRoomState, setRoomState, verifyHostToken } from "./_redis";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const body = await parseRequestBody(req);
    const { room, host, action, turnId, question } = body;

    if (!room || typeof room !== "string") {
      sendJson(res, 400, { ok: false, error: "Thiếu hoặc sai mã phòng" });
      return;
    }

    if (!verifyHostToken(host)) {
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

      const newState = {
        round: nextRound,
        open: true,
        turnId: typeof turnId === "string" ? turnId : "",
        question: typeof question === "string" ? question : "",
        options: ["CHO_QUA" as const, "GIU_LAI" as const],
        openedAt: Date.now(),
      };

      await setRoomState(room, newState);

      sendJson(
        res,
        200,
        {
          ok: true,
          round: nextRound,
          open: true,
          turnId: newState.turnId,
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

    const closedState = {
      ...currentState,
      open: false,
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
      },
      { "Cache-Control": "no-store" },
    );
  } catch (error) {
    sendJson(res, 500, { ok: false, error: "Đã xảy ra lỗi máy chủ khi điều khiển vòng bỏ phiếu" });
  }
}
