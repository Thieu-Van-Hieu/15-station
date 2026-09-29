import { describe, expect, it, beforeEach } from "vitest";
import stateHandler from "./state";
import voteHandler from "./vote";
import tallyHandler from "./tally";
import roundHandler from "./round";
import type { ApiRequest, ApiResponse } from "./_lib";

function createMockReqRes(options: {
  method?: string;
  url?: string;
  query?: Record<string, string>;
  body?: any;
}) {
  const headersSent: Record<string, string> = {};
  let statusCode = 200;
  let responseData: any = null;

  const req: ApiRequest = {
    method: options.method ?? "GET",
    url: options.url ?? "/",
    query: options.query,
    body: options.body,
    headers: {},
  } as any;

  const res: ApiResponse = {
    statusCode: 200,
    setHeader: (name: string, value: string) => {
      headersSent[name.toLowerCase()] = value;
    },
    status: (code: number) => {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
    },
    end: (chunk?: any) => {
      if (chunk && !responseData) {
        try {
          responseData = JSON.parse(chunk);
        } catch {
          responseData = chunk;
        }
      }
    },
  } as any;

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getData: () => responseData,
    getHeader: (name: string) => headersSent[name.toLowerCase()],
  };
}

describe("API Endpoints (Host & Voting - Step 1)", () => {
  const room = "TEST99";
  const hostToken = "secret-host-123";

  beforeEach(() => {
    process.env.HOST_TOKEN = hostToken;
  });

  it("1. GET /api/state khi chưa mở vòng trả về round: 0, open: false và Cache-Control", async () => {
    const { req, res, getStatusCode, getData, getHeader } = createMockReqRes({
      method: "GET",
      url: `/api/state?room=${room}`,
      query: { room },
    });

    await stateHandler(req, res);

    expect(getStatusCode()).toBe(200);
    expect(getData()).toEqual({ round: 0, open: false });
    expect(getHeader("Cache-Control")).toBe("s-maxage=1, stale-while-revalidate=2");
  });

  it("2. POST /api/round từ chối nếu sai host token", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "POST",
      url: "/api/round",
      body: { room, host: "wrong-token", action: "open" },
    });

    await roundHandler(req, res);

    expect(getStatusCode()).toBe(401);
    expect(getData().ok).toBe(false);
  });

  it("3. POST /api/round mở vòng 1 thành công", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "POST",
      url: "/api/round",
      body: {
        room,
        host: hostToken,
        action: "open",
        turnId: "d3-t3",
        question: "Bà Tư mang gạo",
      },
    });

    await roundHandler(req, res);

    expect(getStatusCode()).toBe(200);
    expect(getData()).toEqual({
      ok: true,
      round: 1,
      open: true,
      turnId: "d3-t3",
    });
  });

  it("4. GET /api/state sau khi mở trả về thông tin câu hỏi nhưng KHÔNG lộ số phiếu", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "GET",
      url: `/api/state?room=${room}`,
      query: { room },
    });

    await stateHandler(req, res);

    expect(getStatusCode()).toBe(200);
    const data = getData();
    expect(data.round).toBe(1);
    expect(data.open).toBe(true);
    expect(data.turnId).toBe("d3-t3");
    expect(data.question).toBe("Bà Tư mang gạo");
    expect(data.counts).toBeUndefined(); // Tuyệt đối không trả về số phiếu!
  });

  it("5. POST /api/vote ghi nhận phiếu bầu của cử tri", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "POST",
      url: "/api/vote",
      body: {
        room,
        round: 1,
        voterId: "voter-alice",
        choice: "CHO_QUA",
      },
    });

    await voteHandler(req, res);

    expect(getStatusCode()).toBe(200);
    expect(getData()).toEqual({ ok: true });
  });

  it("6. POST /api/vote cho phép đổi ý (ghi đè cùng voterId)", async () => {
    // Alice đổi ý sang GIU_LAI
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "POST",
      url: "/api/vote",
      body: {
        room,
        round: 1,
        voterId: "voter-alice",
        choice: "GIU_LAI",
      },
    });

    await voteHandler(req, res);
    expect(getStatusCode()).toBe(200);
    expect(getData()).toEqual({ ok: true });

    // Bob bầu CHO_QUA
    const bob = createMockReqRes({
      method: "POST",
      url: "/api/vote",
      body: {
        room,
        round: 1,
        voterId: "voter-bob",
        choice: "CHO_QUA",
      },
    });
    await voteHandler(bob.req, bob.res);
    expect(bob.getData()).toEqual({ ok: true });
  });

  it("7. GET /api/tally host nhận thống kê phiếu chính xác", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "GET",
      url: `/api/tally?room=${room}&host=${hostToken}`,
      query: { room, host: hostToken },
    });

    await tallyHandler(req, res);

    expect(getStatusCode()).toBe(200);
    const tally = getData();
    expect(tally.round).toBe(1);
    expect(tally.open).toBe(true);
    expect(tally.counts.CHO_QUA).toBe(1); // Bob
    expect(tally.counts.GIU_LAI).toBe(1); // Alice (đã đổi ý từ CHO_QUA sang GIU_LAI)
    expect(tally.total).toBe(2);
  });

  it("8. POST /api/round chốt vòng đóng bình chọn", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "POST",
      url: "/api/round",
      body: { room, host: hostToken, action: "close" },
    });

    await roundHandler(req, res);

    expect(getStatusCode()).toBe(200);
    expect(getData().open).toBe(false);
  });

  it("9. POST /api/vote từ chối khi vòng đã đóng", async () => {
    const { req, res, getStatusCode, getData } = createMockReqRes({
      method: "POST",
      url: "/api/vote",
      body: {
        room,
        round: 1,
        voterId: "voter-charlie",
        choice: "CHO_QUA",
      },
    });

    await voteHandler(req, res);

    expect(getStatusCode()).toBe(200);
    expect(getData()).toEqual({ ok: false, reason: "closed" });
  });
});
