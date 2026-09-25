/**
 * Nạp toàn bộ nội dung game từ data/*.json.
 *
 * Đây là nơi DUY NHẤT trong src/ được import data/. Engine (src/engine/) không
 * tự import JSON mà nhận GameContent qua tham số, để scripts/validate-data.ts
 * dùng lại được đúng các hàm đó với một thư mục dữ liệu khác.
 *
 * Kiểu hiện tại suy ra thẳng từ JSON. Ở P2, khi có src/engine/types.ts, ép kiểu
 * về GameContent tại đây một lần duy nhất: validate-data.ts đã bảo đảm dữ liệu
 * đúng schema.
 */

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
};

export type RawContent = typeof content;
