import { useEffect, useState } from "react";
import type { Day, BudgetSummary, Expression } from "../engine/types";
import { content } from "../content";
import { expensesFor, familyLevel } from "../engine/economy";
import { playSfx, setLoop } from "../audio";
import { AppHeader, Label, Panel, Paper, Portrait, PrimaryButton, Screen, cx, s } from "../components/ui";

interface BudgetScreenProps {
  day: Day;
  budget: BudgetSummary;
  /** Hardship cộng dồn trước khi chi hôm nay; quyết định khoản chi nào còn (03 mục 8.4). */
  hardship?: number;
  onSubmitExpenses: (paidExpenseIds: string[]) => void;
}

const FAMILY = ["me-thanh", "hoa", "be-mai", "be-binh"] as const;

export function BudgetScreen({ day, budget, hardship = 0, onSubmitExpenses }: BudgetScreenProps) {
  // Mặc định chọn các khoản thiết yếu trả được
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    let left = budget.available;
    const initial: string[] = [];
    for (const exp of expensesFor(day, hardship)) {
      if (exp.essential && exp.cost <= left) {
        initial.push(exp.id);
        left -= exp.cost;
      }
    }
    return initial;
  });

  const expenses = expensesFor(day, hardship);
  const level = familyLevel(hardship);
  const familyGone = level >= 3;
  const totalCost = expenses.filter((e) => selectedIds.includes(e.id)).reduce((sum, e) => sum + e.cost, 0);
  const remainingMoney = budget.available - totalCost;
  const isOverBudget = remainingMoney < 0;
  const unpaidEssential = expenses.filter((e) => e.essential && !selectedIds.includes(e.id));
  const hasUnpaidEssential = unpaidEssential.length > 0;
  const spentPct = budget.available > 0 ? Math.min(100, Math.round((totalCost / budget.available) * 100)) : totalCost > 0 ? 100 : 0;

  useEffect(() => setLoop("amb_dem_nha"), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isOverBudget) onSubmitExpenses(selectedIds);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOverBudget, onSubmitExpenses, selectedIds]);

  function toggleExpense(id: string) {
    playSfx("pen");
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function mood(member: (typeof FAMILY)[number]): Expression {
    const hurt = unpaidEssential.some((e) => e.member === member);
    switch (member) {
      case "me-thanh":
        return hurt ? "met-moi" : "binh-thuong";
      case "hoa":
        return hasUnpaidEssential ? "lo-lang" : remainingMoney > 0 ? "vui" : "binh-thuong";
      case "be-mai":
        return hurt ? "binh-thuong" : "vui";
      case "be-binh":
        return hurt || (day.family_event && !expenses.some((e) => e.member === "be-binh")) ? "buon" : "binh-thuong";
    }
  }

  return (
    <Screen
      header={
        <AppHeader
          center={<Label className="text-ho-phach">{day.label}</Label>}
          right={<Label className="text-chu-ban-phu/50 hidden md:inline">23:45</Label>}
        />
      }
      className="px-4 md:px-6 py-6"
    >
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div>
          <Label className="text-son-nhat text-[10px]">{s("budget.kicker")}</Label>
          <h1 className="font-tieu-de font-bold text-2xl md:text-3xl text-giay uppercase tracking-wide">{s("budget.title")}</h1>
          <p className="text-[12px] text-chu-ban-phu/60">{day.label}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          {/* Tờ kê chi phí */}
          <Paper tone="bia" tilt={-0.3} className="p-5">
            <div className="flex items-center justify-between border-b-2 border-muc/60 pb-2">
              <h2 className="font-tieu-de font-bold uppercase tracking-wide text-[15px]">{s("budget.ledger_title")}</h2>
              <Label className="text-muc-nhat text-[10px]">12-CT/{day.game_date.slice(0, 4)}</Label>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 font-nhan text-[10px] uppercase tracking-wider text-muc-nhat border-b border-muc/40 py-1.5">
              <span>{s("budget.col_item")}</span>
              <span className="text-right">{s("budget.col_cost")}</span>
              <span className="w-8 text-center">{s("budget.col_pay")}</span>
            </div>

            <ul>
              {expenses.map((exp, i) => {
                const checked = selectedIds.includes(exp.id);
                const member = exp.member ? content.characters.find((c) => c.id === exp.member)?.name : null;
                return (
                  <li key={exp.id}>
                    <label className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 py-3 border-b border-dotted border-muc/35 cursor-pointer hover:bg-bia-dam/50 -mx-2 px-2">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[13px]">
                            {i + 1}. {exp.label}
                          </span>
                          {exp.essential && (
                            <span className="bg-son text-giay font-nhan text-[9px] uppercase tracking-wider px-1.5 py-px">{s("budget.essential")}</span>
                          )}
                        </span>
                        {member && <span className="text-[11px] italic text-muc-nhat">{member}</span>}
                      </span>
                      <span className={cx("font-nhan font-bold text-[15px] text-right", checked ? "text-muc" : "text-muc/40 line-through")}>
                        {exp.cost} {s("ui.money_unit")}
                      </span>
                      <span className="w-8 grid place-items-center">
                        <input type="checkbox" checked={checked} onChange={() => toggleExpense(exp.id)} className="sr-only peer" />
                        <span
                          className={cx(
                            "w-5 h-5 border-2 border-muc grid place-items-center font-bold text-base leading-none peer-focus-visible:outline-2 peer-focus-visible:outline-muc-xanh",
                            checked ? "text-xanh-so-dam" : "text-transparent",
                          )}
                          aria-hidden
                        >
                          ✓
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            {hasUnpaidEssential && (
              <p className="mt-4 border-l-4 border-son bg-son/10 px-3 py-2 text-[12px] italic text-son-dam">{s("budget.unpaid_warning")}</p>
            )}
          </Paper>

          {/* Cân đối tài chính */}
          <div className="space-y-4">
            <Panel title={s("budget.balance_title")}>
              <div className="space-y-2 text-[13px]">
                <Line label={s("budget.carried")} value={budget.carried} />
                {budget.afterReform !== budget.carried && <Line label={s("budget.reform")} value={budget.afterReform} tone="text-ho-phach" />}
                <Line label={s("budget.income")} value={budget.income} sign="+" tone="text-xanh-so-nhat" />
                {budget.bonus > 0 && <Line label={s("budget.bonus")} value={budget.bonus} sign="+" tone="text-xanh-so-nhat" />}
                {budget.fines > 0 && <Line label={s("budget.fines")} value={budget.fines} sign="-" tone="text-son-nhat" />}
                {budget.bribes > 0 && <Line label={s("budget.bribe_money")} value={budget.bribes} sign="+" tone="text-son-nhat" />}
                <div className="flex items-baseline justify-between border-t border-vien pt-3 mt-3">
                  <Label className="text-giay">{s("budget.available")}</Label>
                  <span className="font-tieu-de font-bold text-2xl text-xanh-so-nhat">
                    {budget.available} {s("ui.money_unit")}
                  </span>
                </div>
              </div>

              <div className="mt-4 border border-vien bg-ban-1 p-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-chu-ban-phu">{s("budget.spent")}</span>
                  <span className="font-nhan font-bold">
                    {totalCost} {s("ui.money_unit")}
                  </span>
                </div>
                <div className="h-2 bg-ban-4 mt-2">
                  <div className={cx("h-full transition-all duration-300", isOverBudget ? "bg-son" : "bg-xanh-so")} style={{ width: `${spentPct}%` }} />
                </div>
                <div className="flex items-baseline justify-between gap-3 mt-3">
                  <Label className="text-chu-ban-phu/70 text-[10px]">{s("budget.remaining")}</Label>
                  <span className={cx("font-tieu-de font-bold text-xl", isOverBudget ? "text-son-nhat" : "text-giay")}>
                    {remainingMoney} {s("ui.money_unit")}
                  </span>
                </div>
                {isOverBudget && <p className="text-[11px] text-son-nhat mt-1">{s("budget.over")}</p>}
              </div>
            </Panel>

            {budget.bribes > 0 && (
              <div className="border-2 border-son/60 bg-son/10 p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-son-nhat">{s("budget.bribe_money")}</Label>
                  <span className="font-nhan font-bold text-son-nhat">
                    +{budget.bribes} {s("ui.money_unit")}
                  </span>
                </div>
                <p className="text-[12px] italic text-chu-ban-phu/80 mt-1">{s("budget.bribe_note")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Gia đình */}
        <Panel title={s("budget.family_title")}>
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex gap-2 shrink-0">
              {FAMILY.map((id) => {
                const c = content.characters.find((x) => x.id === id);
                if (!c) return null;
                return (
                  <figure key={id} className="w-20">
                    <Portrait
                      charKey={c.portrait.key}
                      expression={mood(id)}
                      alt={c.name}
                      className={cx("aspect-[5/6] border-2 border-ban-4", familyGone && "opacity-25 grayscale")}
                    />
                    <figcaption className="text-[10px] text-center text-chu-ban-phu/70 mt-1 truncate">
                      {familyGone ? s("family.gone") : c.name}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
            <p className="text-[14px] italic leading-relaxed text-chu-ban self-center">
              &ldquo;{(!familyGone && day.family_event?.text) || (level > 0 ? s(`family.level_${level}`) : s("budget.family_quiet"))}&rdquo;
            </p>
          </div>
        </Panel>

        <div className="flex justify-end pb-6">
          <PrimaryButton
            disabled={isOverBudget}
            onClick={() => onSubmitExpenses(selectedIds)}
            hint="ENTER"
            className="w-full sm:w-auto sm:min-w-[380px]"
          >
            {s("budget.submit")}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

function Line({ label, value, sign = "", tone }: { label: string; value: number; sign?: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-chu-ban-phu">{label}:</span>
      <span className={cx("font-nhan font-bold", tone)}>
        {sign}
        {value} {s("ui.money_unit")}
      </span>
    </div>
  );
}
