import { useState } from "react";
import type { Day, BudgetSummary } from "../engine/types";
import { content } from "../content";

interface BudgetScreenProps {
  day: Day;
  budget: BudgetSummary;
  onSubmitExpenses: (paidExpenseIds: string[]) => void;
}

export function BudgetScreen({ day, budget, onSubmitExpenses }: BudgetScreenProps) {
  // Mặc định chọn các khoản chi trả được
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    let left = budget.available;
    const initial: string[] = [];
    for (const exp of day.economy.expenses) {
      if (exp.essential && exp.cost <= left) {
        initial.push(exp.id);
        left -= exp.cost;
      }
    }
    return initial;
  });

  const totalCost = day.economy.expenses
    .filter((e) => selectedIds.includes(e.id))
    .reduce((sum, e) => sum + e.cost, 0);

  const remainingMoney = budget.available - totalCost;
  const isOverBudget = remainingMoney < 0;

  function toggleExpense(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  const hasUnpaidEssential = day.economy.expenses.some(
    (e) => e.essential && !selectedIds.includes(e.id),
  );

  return (
    <div className="min-h-screen bg-xi-mang text-muc font-may-chu p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full border-4 border-nau bg-giay p-6 rounded shadow-2xl space-y-6">
        <header className="border-b-2 border-nau/40 pb-2 text-center">
          <h2 className="text-xl font-bold text-dau-do uppercase tracking-wide">
            {content.strings["budget.title"]}
          </h2>
          <p className="text-xs text-muc/70 font-mono mt-1">{day.label}</p>
        </header>

        {/* Bảng thu chi tổng hợp */}
        <div className="space-y-2 text-xs border-b border-nau/30 pb-4">
          <div className="flex justify-between">
            <span>{content.strings["budget.income"]}:</span>
            <span className="font-mono font-semibold">+{budget.income}</span>
          </div>

          {budget.bonus > 0 && (
            <div className="flex justify-between text-green-800">
              <span>{content.strings["budget.bonus"]}:</span>
              <span className="font-mono font-semibold">+{budget.bonus}</span>
            </div>
          )}

          {budget.fines > 0 && (
            <div className="flex justify-between text-dau-do">
              <span>{content.strings["budget.fines"]}:</span>
              <span className="font-mono font-semibold">-{budget.fines}</span>
            </div>
          )}

          {budget.bribes > 0 && (
            <div className="flex justify-between text-yellow-800 font-bold">
              <span>{content.strings["budget.bribe_money"]}:</span>
              <span className="font-mono font-semibold">+{budget.bribes}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-nau/40 font-bold text-sm">
            <span>{content.strings["budget.available"]}:</span>
            <span className="font-mono text-nau">{budget.available}</span>
          </div>
        </div>

        {/* Danh sách các khoản chi */}
        <div className="space-y-2.5">
          {day.economy.expenses.map((exp) => {
            const checked = selectedIds.includes(exp.id);
            return (
              <label
                key={exp.id}
                className={`flex items-center justify-between p-3 border-2 rounded cursor-pointer transition-colors text-xs ${
                  checked ? "border-nau bg-nau/10" : "border-neutral-300 bg-neutral-100/50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleExpense(exp.id)}
                    className="w-4 h-4 accent-nau cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold">{exp.label}</span>
                    {exp.member && (
                      <span className="text-[10px] text-neutral-500 ml-2 italic">({exp.member})</span>
                    )}
                  </div>
                </div>
                <span className="font-mono font-bold text-dau-do">{exp.cost}</span>
              </label>
            );
          })}
        </div>

        {hasUnpaidEssential && (
          <p className="text-[11px] text-dau-do italic bg-red-100 p-2 rounded border border-dau-do/30">
            {content.strings["budget.unpaid_warning"]}
          </p>
        )}

        <div className="flex justify-between items-center pt-2 font-bold text-sm border-t border-nau/30">
          <span>{content.strings["budget.remaining"]}:</span>
          <span className={`font-mono ${isOverBudget ? "text-dau-do" : "text-nau"}`}>
            {remainingMoney}
          </span>
        </div>

        <button
          type="button"
          disabled={isOverBudget}
          onClick={() => onSubmitExpenses(selectedIds)}
          className={`w-full py-3 text-sm font-bold uppercase tracking-wider rounded shadow-md border-2 ${
            isOverBudget
              ? "opacity-40 cursor-not-allowed bg-neutral-400 border-neutral-600 text-neutral-200"
              : "bg-nau hover:bg-nau/90 text-giay border-giay transition-colors active:scale-[0.99]"
          }`}
        >
          {content.strings["budget.submit"]}
        </button>
      </div>
    </div>
  );
}
