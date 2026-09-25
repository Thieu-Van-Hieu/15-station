/**
 * Nạp toàn bộ nội dung game từ data/*.json.
 *
 * Đây là nơi DUY NHẤT trong src/ được import data/. Engine (src/engine/) không
 * tự import JSON mà nhận GameContent qua tham số, để scripts/validate-data.ts
 * dùng lại được đúng các hàm đó với một thư mục dữ liệu khác.
 *
 * Ép kiểu về GameContent tại đây, một lần duy nhất. An toàn vì validate-data.ts
 * đã bảo đảm dữ liệu đúng schema; TypeScript không tự suy ra được các kiểu hợp
 * (union) từ JSON nên phải qua `unknown`.
 */

import type { GameContent } from "./engine/types";
import characters from "../data/characters.json";
import days from "../data/days.json";
import documents from "../data/documents.json";
import endings from "../data/endings.json";
import reports from "../data/reports.json";
import rules from "../data/rules.json";
import strings from "../data/strings.json";
import travelers from "../data/travelers.json";

export const content = {
  rules,
  documents,
  characters,
  days,
  travelers,
  reports,
  endings,
  strings,
} as unknown as GameContent;
