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
