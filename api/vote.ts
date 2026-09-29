/**
 * POST /api/vote
 * Client gửi phiếu bầu { room, round, voterId, choice }.
 * Ghi bằng HSET vào hash của vòng đó, một voterId ghi đè nếu bỏ phiếu lại.
 * Nếu round không khớp vòng đang mở hoặc vòng đã đóng, trả { ok: false, reason: "closed" }.
 * Không cache.
 */

import type { ApiRequest, ApiResponse } from "./_lib.js";
import { ConfigError, parseRequestBody, sendJson } from "./_lib.js";
import { addVote, getRoomState, type VoteChoice } from "./_redis.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const body = await parseRequestBody(req);
    const { room, round, voterId, choice } = body;

    if (!room || typeof room !== "string") {
      sendJson(res, 400, { ok: false, error: "Thiếu hoặc sai mã phòng" });
      return;
    }

    if (typeof round !== "number" || round <= 0) {
      sendJson(res, 400, { ok: false, error: "Thiếu hoặc sai số thứ tự vòng" });
      return;
    }

    if (!voterId || typeof voterId !== "string") {
      sendJson(res, 400, { ok: false, error: "Thiếu định danh cử tri (voterId)" });
      return;
    }

    if (choice !== "CHO_QUA" && choice !== "GIU_LAI") {
      sendJson(res, 400, { ok: false, error: "Lựa chọn không hợp lệ (phải là CHO_QUA hoặc GIU_LAI)" });
      return;
    }

    const state = await getRoomState(room);

    // Kiểm tra vòng bỏ phiếu có đang mở và đúng round hay không
    // Cho trễ 2 giây vì đồng hồ máy chiếu và mạng lớp học không khớp tuyệt đối.
    const expired = typeof state.endsAt === "number" && Date.now() > state.endsAt + 2000;
    if (!state.open || state.round !== round || expired) {
      sendJson(res, 200, { ok: false, reason: "closed" }, { "Cache-Control": "no-store" });
      return;
    }

    await addVote(room, round, voterId.trim(), choice as VoteChoice);

    sendJson(res, 200, { ok: true }, { "Cache-Control": "no-store" });
  } catch (error) {
    if (error instanceof ConfigError) {
      sendJson(res, 503, { ok: false, error: error.message }, { "Cache-Control": "no-store" });
      return;
    }
    sendJson(res, 500, { ok: false, error: "Đã xảy ra lỗi máy chủ khi ghi nhận phiếu bầu" });
  }
}
