/**
 * Kết nối Upstash Redis và logic lưu trữ cho Chế độ Host (P4).
 * Hỗ trợ Upstash Redis qua REST API (@upstash/redis) và memory fallback khi chạy local/test không có credentials.
 */

import { timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { ConfigError } from "./_lib.js";

export interface RoomState {
  round: number;
  open: boolean;
  turnId?: string;
  question?: string;
  options?: ("CHO_QUA" | "GIU_LAI")[];
  openedAt?: number;
  /** Mốc hết giờ bỏ phiếu (ms). Sau mốc này phiếu mới bị từ chối. */
  endsAt?: number;
  /** Số phiếu chốt lúc đóng vòng. Chỉ có khi vòng đã đóng, để điện thoại xem kết quả mà không lộ số phiếu lúc đang bầu. */
  result?: { CHO_QUA: number; GIU_LAI: number };
}

export type VoteChoice = "CHO_QUA" | "GIU_LAI";

const TTL_SECONDS = 6 * 3600; // 6 giờ

// Fallback in-memory store dùng cho local dev và automated test khi chưa cắm Upstash credentials
class MemoryStore {
  private states = new Map<string, RoomState>();
  private votes = new Map<string, Map<string, VoteChoice>>();
  private members = new Map<string, Set<string>>();

  async addMember(room: string, voterId: string): Promise<void> {
    if (!this.members.has(room)) this.members.set(room, new Set());
    this.members.get(room)!.add(voterId);
  }

  async countMembers(room: string): Promise<number> {
    return this.members.get(room)?.size ?? 0;
  }

  async getState(room: string): Promise<RoomState | null> {
    return this.states.get(room) ?? null;
  }

  async setState(room: string, state: RoomState): Promise<void> {
    this.states.set(room, state);
  }

  async recordVote(room: string, round: number, voterId: string, choice: VoteChoice): Promise<void> {
    const key = `${room}:${round}`;
    if (!this.votes.has(key)) {
      this.votes.set(key, new Map());
    }
    this.votes.get(key)!.set(voterId, choice);
  }

  async getVotes(room: string, round: number): Promise<Record<string, VoteChoice>> {
    const key = `${room}:${round}`;
    const map = this.votes.get(key);
    if (!map) return {};
    const result: Record<string, VoteChoice> = {};
    for (const [k, v] of map.entries()) {
      result[k] = v;
    }
    return result;
  }

  async clearVotes(room: string, round: number): Promise<void> {
    const key = `${room}:${round}`;
    this.votes.delete(key);
  }
}

const memoryStore = new MemoryStore();

/** Đang chạy trên Vercel (production hoặc preview). Ở đó mỗi request có thể rơi vào một instance khác. */
function onVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

let client: Redis | null = null;

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    client ??= new Redis({ url, token });
    return client;
  }
  // Trên Vercel, bộ nhớ trong không sống giữa các request: dùng nó thì phiếu của lớp rơi vào các instance khác nhau
  // và host không bao giờ thấy. Báo lỗi rõ để màn host chuyển sang đường lui nhập tay, thay vì âm thầm sai.
  if (onVercel()) throw new ConfigError("Máy chủ chưa cấu hình Upstash Redis (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN).");
  return null;
}

export async function getRoomState(room: string): Promise<RoomState> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    const data = await redis.get<RoomState>(`t15:${normalized}:state`);
    return data ?? { round: 0, open: false };
  }

  const data = await memoryStore.getState(normalized);
  return data ?? { round: 0, open: false };
}

export async function setRoomState(room: string, state: RoomState): Promise<void> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    await redis.set(`t15:${normalized}:state`, JSON.stringify(state), { ex: TTL_SECONDS });
    return;
  }

  await memoryStore.setState(normalized, state);
}

export async function addVote(
  room: string,
  round: number,
  voterId: string,
  choice: VoteChoice,
): Promise<void> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    const key = `t15:${normalized}:votes:${round}`;
    await redis.hset(key, { [voterId]: choice });
    await redis.expire(key, TTL_SECONDS);
    return;
  }

  await memoryStore.recordVote(normalized, round, voterId, choice);
}

export async function getRoomVotes(
  room: string,
  round: number,
): Promise<Record<string, VoteChoice>> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    const key = `t15:${normalized}:votes:${round}`;
    const data = await redis.hgetall<Record<string, VoteChoice>>(key);
    return data ?? {};
  }

  return await memoryStore.getVotes(normalized, round);
}

export async function clearRoomVotes(room: string, round: number): Promise<void> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    const key = `t15:${normalized}:votes:${round}`;
    await redis.del(key);
    return;
  }

  await memoryStore.clearVotes(normalized, round);
}

/** Ghi nhận một điện thoại đã vào phòng (mỗi máy gọi một lần), để màn chiếu đếm "đã vào phòng". */
export async function addRoomMember(room: string, voterId: string): Promise<void> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    const key = `t15:${normalized}:members`;
    await redis.sadd(key, voterId);
    await redis.expire(key, TTL_SECONDS);
    return;
  }

  await memoryStore.addMember(normalized, voterId);
}

export async function countRoomMembers(room: string): Promise<number> {
  const normalized = room.trim().toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    return await redis.scard(`t15:${normalized}:members`);
  }

  return await memoryStore.countMembers(normalized);
}

/** Đếm phiếu của một vòng. */
export function countVotes(votes: Record<string, VoteChoice>): { CHO_QUA: number; GIU_LAI: number } {
  const counts = { CHO_QUA: 0, GIU_LAI: 0 };
  for (const choice of Object.values(votes)) {
    if (choice === "CHO_QUA" || choice === "GIU_LAI") counts[choice]++;
  }
  return counts;
}

/**
 * Kiểm tra token host. Chỉ khi chạy ở máy (không phải Vercel) mà chưa đặt HOST_TOKEN thì mới nhận mọi token không rỗng,
 * cho tiện thử. Trên Vercel thiếu HOST_TOKEN là lỗi cấu hình: không cho ai điều khiển vòng bỏ phiếu.
 */
export function verifyHostToken(providedToken?: string | null): boolean {
  const expectedToken = process.env.HOST_TOKEN;
  if (!expectedToken) {
    if (onVercel()) throw new ConfigError("Máy chủ chưa cấu hình HOST_TOKEN.");
    return typeof providedToken === "string" && providedToken.trim().length > 0;
  }
  if (typeof providedToken !== "string") return false;
  const a = Buffer.from(providedToken);
  const b = Buffer.from(expectedToken);
  return a.length === b.length && timingSafeEqual(a, b);
}
