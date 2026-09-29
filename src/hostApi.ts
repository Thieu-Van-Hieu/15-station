/**
 * Tiện ích chung cho màn /host và bảng bỏ phiếu ở bàn game (P4).
 */
import { content } from "./content";

/** Câu báo lỗi dễ hiểu cho người chủ trì khi máy chủ từ chối (sai token, thiếu cấu hình). */
export async function explainHostError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 401) return content.strings["host.token_invalid"];
  if (res.status === 503) return `${content.strings["host.server_config"]}: ${data.error ?? ""} ${content.strings["host.use_manual"]}`;
  return data.error ?? content.strings["host.error"];
}

/** Thông báo về token hoặc cấu hình, tự xoá khi máy chủ trả lời bình thường trở lại. */
export function isHostSetupMessage(m: string): boolean {
  return (
    m === content.strings["host.token_missing"] ||
    m === content.strings["host.token_invalid"] ||
    m.startsWith(content.strings["host.server_config"])
  );
}

export const HOST_TOKEN_KEY = "tram15_host_token";

export function readHostToken(): string {
  try {
    // Không có token mặc định: token chỉ nằm ở máy chủ và trong trình duyệt của người chủ trì, không nằm trong bundle.
    return localStorage.getItem(HOST_TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveHostToken(token: string): void {
  try {
    localStorage.setItem(HOST_TOKEN_KEY, token);
  } catch {
    // Bỏ qua lỗi localStorage
  }
}

/** Kết quả `GET /api/tally`. */
export interface TallyData {
  round: number;
  open: boolean;
  turnId?: string;
  counts: { CHO_QUA: number; GIU_LAI: number };
  total: number;
  /** Số điện thoại đã vào phòng. */
  joined?: number;
  endsAt?: number;
}

/** Gọi `/api/round` với token của người chủ trì. Ném lỗi kèm câu giải thích khi máy chủ từ chối. */
export async function postRound(token: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch("/api/round", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await explainHostError(res));
  return (await res.json()) as Record<string, unknown>;
}
