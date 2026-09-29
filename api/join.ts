/**
 * POST /api/join
 * Điện thoại báo đã vào phòng { room, voterId } (một lần mỗi phòng), để màn chiếu đếm số người trong phòng chờ.
 * Không cache.
 */

import type { ApiRequest, ApiResponse } from "./_lib.js";
import { ConfigError, parseRequestBody, sendJson } from "./_lib.js";
import { addRoomMember } from "./_redis.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Phương thức không được hỗ trợ" });
      return;
    }

    const { room, voterId } = await parseRequestBody(req);

    if (!room || typeof room !== "string" || !room.trim()) {
      sendJson(res, 400, { ok: false, error: "Thiếu hoặc sai mã phòng" });
      return;
    }

    if (!voterId || typeof voterId !== "string" || voterId.length > 80) {
      sendJson(res, 400, { ok: false, error: "Thiếu định danh cử tri (voterId)" });
      return;
    }

    await addRoomMember(room, voterId.trim());
    sendJson(res, 200, { ok: true }, { "Cache-Control": "no-store" });
  } catch (error) {
    if (error instanceof ConfigError) {
      sendJson(res, 503, { ok: false, error: error.message }, { "Cache-Control": "no-store" });
      return;
    }
    sendJson(res, 500, { ok: false, error: "Đã xảy ra lỗi máy chủ khi vào phòng" });
  }
}
