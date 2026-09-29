/**
 * Kết nối Upstash Redis và logic lưu trữ cho Chế độ Host (P4).
 * Hỗ trợ Upstash Redis qua REST API (@upstash/redis) và memory fallback khi chạy local/test không có credentials.
 */

import { Redis } from "@upstash/redis";

export interface RoomState {
  round: number;
  open: boolean;
  turnId?: string;
  question?: string;
  options?: ("CHO_QUA" | "GIU_LAI")[];
  openedAt?: number;
}

export type VoteChoice = "CHO_QUA" | "GIU_LAI";

const TTL_SECONDS = 6 * 3600; // 6 giờ

// Fallback in-memory store dùng cho local dev và automated test khi chưa cắm Upstash credentials
class MemoryStore {
  private states = new Map<string, RoomState>();
  private votes = new Map<string, Map<string, VoteChoice>>();

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

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
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

export function verifyHostToken(providedToken?: string | null): boolean {
  const expectedToken = process.env.HOST_TOKEN;
  if (!expectedToken) {
    // Nếu chưa cấu hình HOST_TOKEN trên môi trường, chấp nhận bất kỳ token không rỗng nào
    return typeof providedToken === "string" && providedToken.trim().length > 0;
  }
  return providedToken === expectedToken;
}
