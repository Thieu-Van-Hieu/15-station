/**
 * GET /api/state?room=<mã>
 * Client gọi để lấy trạng thái vòng bỏ phiếu hiện tại.
 * Header: Cache-Control: s-maxage=1, stale-while-revalidate=2 để CDN Vercel gộp request.
 * Tuyệt đối không trả về số phiếu!
 */

import type { ApiRequest, ApiResponse } from "./_lib";
import { parseQueryParams, sendJson } from "./_lib";
import { getRoomState } from "./_redis";

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
      },
      headers,
    );
  } catch (error) {
    sendJson(res, 500, { error: "Đã xảy ra lỗi máy chủ khi lấy trạng thái phòng" });
  }
}
