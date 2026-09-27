import type { Day, DayReport, Indicators } from "../engine/types";
import { content } from "../content";

interface DayEndScreenProps {
  day: Day;
  dayReport: DayReport;
  indicatorsStart: Indicators;
  indicatorsEnd: Indicators;
  onContinue: () => void;
}

export function DayEndScreen({
  day,
  dayReport,
  indicatorsStart,
  indicatorsEnd,
  onContinue,
}: DayEndScreenProps) {
  const percentDeltaFood =
    indicatorsStart.luong_thuc_vao_thi_xa === 0
      ? 0
      : Math.round(
          ((indicatorsEnd.luong_thuc_vao_thi_xa - indicatorsStart.luong_thuc_vao_thi_xa) /
            indicatorsStart.luong_thuc_vao_thi_xa) *
            100,
        );

  const foodChangeText =
    percentDeltaFood >= 0 ? `+${percentDeltaFood}%` : `${percentDeltaFood}%`;

  return (
    <div className="min-h-screen bg-xi-mang text-muc font-may-chu p-6 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <header className="border-b-2 border-nau/40 pb-3 text-center">
          <h2 className="text-2xl font-bold text-dau-do uppercase tracking-wide">{day.label}</h2>
          <p className="text-xs text-muc/70 font-mono mt-1">{day.game_date}</p>
        </header>

        {/* Hai bảng đặt cạnh nhau */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bảng trái: BÁO CÁO GỬI CẤP TRÊN */}
          <div className="border-4 border-nau bg-giay p-6 rounded shadow-lg flex flex-col justify-between">
            <div>
              <div className="border-b-2 border-nau/40 pb-2 mb-4 text-center">
                <h3 className="font-bold text-base tracking-wider uppercase text-nau">
                  {content.strings["board.left.title"]}
                </h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between border-b border-nau/20 pb-1">
                  <span>{content.strings["board.left.compliance"]}:</span>
                  <span className="font-bold font-mono">
                    {Math.round(dayReport.rate * 100)}%
                  </span>
                </div>

                <div className="flex justify-between border-b border-nau/20 pb-1">
                  <span>{content.strings["board.left.rejections"]}:</span>
                  <span className="font-mono">{dayReport.heldCount}</span>
                </div>

                <div className="flex justify-between border-b border-nau/20 pb-1">
                  <span>{content.strings["board.left.confiscated"]}:</span>
                  <span className="font-mono">{dayReport.seizedKg} kg</span>
                </div>

                <div className="flex justify-between border-b border-nau/20 pb-1">
                  <span>{content.strings["board.left.reports"]}:</span>
                  <span className="font-mono">{dayReport.validReports}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold">{content.strings["board.left.rating"]}:</span>
                  <span className="px-3 py-1 bg-dau-do text-white font-bold text-xs uppercase rounded">
                    {dayReport.grade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng phải: TÌNH HÌNH HUYỆN (số liệu mô phỏng) */}
          <div className="border-4 border-neutral-700 bg-giay p-6 rounded shadow-lg flex flex-col justify-between">
            <div>
              <div className="border-b-2 border-neutral-400 pb-2 mb-4 text-center">
                <h3 className="font-bold text-base tracking-wider uppercase text-neutral-800">
                  {content.strings["board.right.title"]}
                </h3>
                <span className="text-[11px] italic text-neutral-500">
                  {content.strings["board.right.simulated"]}
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between border-b border-neutral-300 pb-1">
                  <span>{content.strings["board.right.food_inflow"]}:</span>
                  <span className="font-bold font-mono">{foodChangeText}</span>
                </div>

                <div className="flex justify-between border-b border-neutral-300 pb-1">
                  <span>{content.strings["board.right.hunger_cases"]}:</span>
                  <span className="font-mono">
                    {indicatorsStart.ho_thieu_an} → {indicatorsEnd.ho_thieu_an}
                  </span>
                </div>

                <div className="flex justify-between border-b border-neutral-300 pb-1">
                  <span>{content.strings["board.right.rice_price"]}:</span>
                  <span className="font-mono">
                    {indicatorsStart.gia_gao_index} → {indicatorsEnd.gia_gao_index}
                  </span>
                </div>

                {/* Yếu tố khách quan */}
                <div className="mt-4 p-2.5 bg-neutral-200/80 border border-neutral-300 rounded text-[11px]">
                  <div className="font-semibold text-neutral-700 mb-1">
                    {content.strings["board.right.other_factors"]}:
                  </div>
                  <p className="italic text-neutral-600">{day.other_factor.text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nút sang bước chi tiêu gia đình */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onContinue}
            className="px-8 py-3 bg-nau hover:bg-nau/90 text-giay font-bold text-sm tracking-widest uppercase rounded shadow-lg border-2 border-giay transition-colors"
          >
            {content.strings["board.go_budget"]} →
          </button>
        </div>
      </div>
    </div>
  );
}
