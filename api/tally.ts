/**
 * GET /api/tally?room=<mã>&host=<token>
 * Chỉ màn host gọi để lấy số lượng phiếu realtime.
 * Sai token trả 401. Không cache.
 */

import type { ApiRequest, ApiResponse } from "./_lib";
import { parseQueryParams, sendJson } from "./_lib";
import { getRoomState, getRoomVotes, verifyHostToken } from "./_redis";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const params = parseQueryParams(req);
    const room = params.get("room");
    const hostToken = params.get("host");

    if (!room || room.trim().length === 0) {
      sendJson(res, 400, { error: "Thiếu mã phòng" });
      return;
    }

    if (!verifyHostToken(hostToken)) {
      sendJson(res, 401, { error: "Mã xác thực host không hợp lệ" });
      return;
    }

    const state = await getRoomState(room);

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
        },
        { "Cache-Control": "no-store" },
      );
      return;
    }

    const votes = await getRoomVotes(room, state.round);
    let choQuaCount = 0;
    let giuLaiCount = 0;

    for (const choice of Object.values(votes)) {
      if (choice === "CHO_QUA") choQuaCount++;
      else if (choice === "GIU_LAI") giuLaiCount++;
    }

    sendJson(
      res,
      200,
      {
        round: state.round,
        open: state.open,
        turnId: state.turnId ?? "",
        counts: {
          CHO_QUA: choQuaCount,
          GIU_LAI: giuLaiCount,
        },
        total: choQuaCount + giuLaiCount,
      },
      { "Cache-Control": "no-store" },
    );
  } catch (error) {
    sendJson(res, 500, { error: "Đã xảy ra lỗi máy chủ khi thống kê phiếu bầu" });
  }
}
