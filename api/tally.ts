/**
 * GET /api/tally?room=<mã>&host=<token>
 * Chỉ màn host gọi để lấy số lượng phiếu realtime.
 * Sai token trả 401. Không cache.
 */

import type { ApiRequest, ApiResponse } from "./_lib.js";
import { ConfigError, hostTokenFrom, parseQueryParams, sendJson } from "./_lib.js";
import { countRoomMembers, countVotes, getRoomState, getRoomVotes, verifyHostToken } from "./_redis.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const params = parseQueryParams(req);
    const room = params.get("room");
    const hostToken = hostTokenFrom(req, params.get("host"));

    if (!room || room.trim().length === 0) {
      sendJson(res, 400, { error: "Thiếu mã phòng" });
      return;
    }

    if (!verifyHostToken(hostToken)) {
      sendJson(res, 401, { error: "Mã xác thực host không hợp lệ" });
      return;
    }

    const [state, joined] = await Promise.all([getRoomState(room), countRoomMembers(room)]);

    if (!state || state.round === 0) {
      sendJson(
        res,
        200,
        {
          round: 0,
          open: false,
          turnId: "",
          counts: { CHO_QUA: 0, GIU_LAI: 0 },
          total: 0,
          joined,
        },
        { "Cache-Control": "no-store" },
      );
      return;
    }

    const counts = countVotes(await getRoomVotes(room, state.round));

    sendJson(
      res,
      200,
      {
        round: state.round,
        open: state.open,
        turnId: state.turnId ?? "",
        counts,
        total: counts.CHO_QUA + counts.GIU_LAI,
        joined,
        ...(state.endsAt ? { endsAt: state.endsAt } : {}),
      },
      { "Cache-Control": "no-store" },
    );
  } catch (error) {
    if (error instanceof ConfigError) {
      sendJson(res, 503, { ok: false, error: error.message }, { "Cache-Control": "no-store" });
      return;
    }
    sendJson(res, 500, { error: "Đã xảy ra lỗi máy chủ khi thống kê phiếu bầu" });
  }
}
