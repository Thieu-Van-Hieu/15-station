/**
 * GET /api/state?room=<mã>
 * Client gọi để lấy trạng thái vòng bỏ phiếu hiện tại.
 * Header: Cache-Control: s-maxage=1, stale-while-revalidate=2 để CDN Vercel gộp request.
 * Tuyệt đối không trả về số phiếu khi vòng đang mở! Vòng đã đóng thì trả `result` để điện thoại xem kết quả.
 */

import type { ApiRequest, ApiResponse } from "./_lib.js";
import { ConfigError, parseQueryParams, sendJson } from "./_lib.js";
import { getRoomState } from "./_redis.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const params = parseQueryParams(req);
    const room = params.get("room");

    if (!room || room.trim().length === 0) {
      sendJson(res, 400, { error: "Thiếu mã phòng" });
      return;
    }

    const state = await getRoomState(room);

    const headers = {
      "Cache-Control": "s-maxage=1, stale-while-revalidate=2",
    };

    if (!state || state.round === 0) {
      sendJson(res, 200, { round: 0, open: false }, headers);
      return;
    }

    sendJson(
      res,
      200,
      {
        round: state.round,
        open: state.open,
        turnId: state.turnId ?? "",
        question: state.question ?? "",
        options: state.options ?? ["CHO_QUA", "GIU_LAI"],
        ...(state.endsAt ? { endsAt: state.endsAt, openedAt: state.openedAt } : {}),
        ...(!state.open && state.result ? { result: state.result } : {}),
      },
      headers,
    );
  } catch (error) {
    if (error instanceof ConfigError) {
      sendJson(res, 503, { ok: false, error: error.message }, { "Cache-Control": "no-store" });
      return;
    }
    sendJson(res, 500, { error: "Đã xảy ra lỗi máy chủ khi lấy trạng thái phòng" });
  }
}
