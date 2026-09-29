import { afterAll, describe, expect, it, beforeEach } from "vitest";
import stateHandler from "./state.js";
import voteHandler from "./vote.js";
import tallyHandler from "./tally.js";
import roundHandler from "./round.js";
import joinHandler from "./join.js";
import type { ApiRequest, ApiResponse } from "./_lib.js";

function createMockReqRes(options: {
  method?: string;
  url?: string;
  query?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
}) {
  const headersSent: Record<string, string> = {};
  let statusCode = 200;
  let responseData: any = null;

  const req: ApiRequest = {
    method: options.method ?? "GET",
    url: options.url ?? "/",
    query: options.query,
    body: options.body,
    headers: options.headers ?? {},
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

describe("API — sửa lỗi P4: token qua header, thiếu cấu hình trên Vercel", () => {
  const room = "HDR1";
  const token = "tok-123";
  const saved = { ...process.env };

  beforeEach(() => {
    process.env = { ...saved, HOST_TOKEN: token };
    delete process.env.VERCEL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterAll(() => {
    process.env = saved;
  });

  it("P4-FIX-01 màn host gửi token bằng header Authorization: Bearer — round và tally chấp nhận", async () => {
    const open = createMockReqRes({
      method: "POST",
      url: "/api/round",
      headers: { authorization: `Bearer ${token}` },
      body: { room, action: "open", turnId: "d3-t3", question: "q" },
    });
    await roundHandler(open.req, open.res);
    expect(open.getStatusCode()).toBe(200);

    const tally = createMockReqRes({
      method: "GET",
      url: `/api/tally?room=${room}`,
      query: { room },
      headers: { authorization: `Bearer ${token}` },
    });
    await tallyHandler(tally.req, tally.res);
    expect(tally.getStatusCode()).toBe(200);
    // Hợp đồng API: số phiếu nằm trong `counts` (màn host và bàn game đọc đúng trường này).
    expect(tally.getData().counts).toEqual({ CHO_QUA: 0, GIU_LAI: 0 });
  });

  it("P4-FIX-02 header sai token thì 401", async () => {
    const r = createMockReqRes({
      method: "GET",
      url: `/api/tally?room=${room}`,
      query: { room },
      headers: { authorization: "Bearer sai" },
    });
    await tallyHandler(r.req, r.res);
    expect(r.getStatusCode()).toBe(401);
  });

  it("P4-FIX-03 trên Vercel thiếu HOST_TOKEN thì 503, không nhận bừa mọi token", async () => {
    process.env.VERCEL = "1";
    process.env.UPSTASH_REDIS_REST_URL = "https://example.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "x";
    delete process.env.HOST_TOKEN;
    const r = createMockReqRes({ method: "POST", url: "/api/round", body: { room, host: "bat-ky", action: "close" } });
    await roundHandler(r.req, r.res);
    expect(r.getStatusCode()).toBe(503);
    expect(r.getData().error).toContain("HOST_TOKEN");
  });

  it("P4-FIX-04 trên Vercel thiếu Upstash thì 503, không dùng bộ nhớ trong (mỗi instance một bản)", async () => {
    process.env.VERCEL = "1";
    const r = createMockReqRes({ method: "GET", url: `/api/state?room=${room}`, query: { room } });
    await stateHandler(r.req, r.res);
    expect(r.getStatusCode()).toBe(503);
    expect(r.getData().error).toContain("Upstash");
  });
});

describe("API — phiên hội đồng: đồng hồ, kết quả sau khi chốt, đếm người vào phòng", () => {
  const room = "CLS1";
  const token = "tok-cls";
  const saved = { ...process.env };

  beforeEach(() => {
    process.env = { ...saved, HOST_TOKEN: token };
    delete process.env.VERCEL;
  });

  afterAll(() => {
    process.env = saved;
  });

  async function call(handler: (req: ApiRequest, res: ApiResponse) => Promise<void>, opts: Parameters<typeof createMockReqRes>[0]) {
    const r = createMockReqRes(opts);
    await handler(r.req, r.res);
    return r;
  }
  const auth = { authorization: `Bearer ${token}` };

  it("CLS-01 mở vòng có seconds thì trả endsAt, kẹp trong 10–300 giây", async () => {
    const before = Date.now();
    const r = await call(roundHandler, { method: "POST", headers: auth, body: { room, action: "open", turnId: "d3-t3", seconds: 5 } });
    const endsAt = r.getData().endsAt;
    expect(endsAt).toBeGreaterThanOrEqual(before + 10_000);
    expect(endsAt).toBeLessThan(before + 11_000);
  });

  it("CLS-02 /api/join đếm mỗi điện thoại một lần, tally trả joined", async () => {
    await call(joinHandler, { method: "POST", body: { room, voterId: "a" } });
    await call(joinHandler, { method: "POST", body: { room, voterId: "a" } });
    await call(joinHandler, { method: "POST", body: { room, voterId: "b" } });
    const bad = await call(joinHandler, { method: "POST", body: { room } });
    expect(bad.getStatusCode()).toBe(400);
    const tally = await call(tallyHandler, { method: "GET", query: { room }, headers: auth });
    expect(tally.getData().joined).toBe(2);
  });

  it("CLS-03 state giấu số phiếu khi đang mở, chốt xong thì trả result", async () => {
    await call(voteHandler, { method: "POST", body: { room, round: 1, voterId: "a", choice: "CHO_QUA" } });
    await call(voteHandler, { method: "POST", body: { room, round: 1, voterId: "b", choice: "GIU_LAI" } });
    await call(voteHandler, { method: "POST", body: { room, round: 1, voterId: "c", choice: "CHO_QUA" } });
    const open = await call(stateHandler, { method: "GET", query: { room } });
    expect(open.getData().result).toBeUndefined();
    expect(open.getData().endsAt).toBeDefined();

    const close = await call(roundHandler, { method: "POST", headers: auth, body: { room, action: "close" } });
    expect(close.getData().counts).toEqual({ CHO_QUA: 2, GIU_LAI: 1 });
    const closed = await call(stateHandler, { method: "GET", query: { room } });
    expect(closed.getData().result).toEqual({ CHO_QUA: 2, GIU_LAI: 1 });
    expect(closed.getData().closedAt).toBeGreaterThan(Date.now() - 5000);
  });

  it("CLS-04 hết giờ thì phiếu mới bị từ chối", async () => {
    const r = await call(roundHandler, { method: "POST", headers: auth, body: { room, action: "open", turnId: "d3-t3", seconds: 10 } });
    const round = r.getData().round;
    const realNow = Date.now;
    Date.now = () => realNow() + 13_000;
    try {
      const v = await call(voteHandler, { method: "POST", body: { room, round, voterId: "z", choice: "CHO_QUA" } });
      expect(v.getData()).toEqual({ ok: false, reason: "closed" });
    } finally {
      Date.now = realNow;
    }
  });
});
