"use client";
import AgentPanel from "./AgentPanel";

const checklist = [
  { task: "Pull trial balance from GL", done: true },
  { task: "Post accruals — rent & utilities", done: true },
  { task: "Post accruals — payroll", done: true },
  { task: "Depreciation schedule roll-forward", done: true },
  { task: "Prepayment amortisation", done: false },
  { task: "Intercompany eliminations", done: false },
  { task: "Variance commentary — P&L vs budget", done: false },
  { task: "Variance commentary — vs prior period", done: false },
  { task: "Assemble close package", done: false },
  { task: "Controller sign-off", done: false },
];

const accruals = [
  { desc: "Rent — 5 locations", ref: "Lease agreements", amount: "KWD 185,000", je: "DR Rent Exp / CR Accrued Liabilities" },
  { desc: "Utilities — DEWA + du", ref: "Utility estimates", amount: "KWD 22,400", je: "DR Utilities / CR Accrued Liabilities" },
  { desc: "Payroll accrual", ref: "HR schedule", amount: "KWD 310,000", je: "DR Salaries / CR Payroll Payable" },
  { desc: "Depreciation — FF&E", ref: "Asset register", amount: "KWD 18,750", je: "DR Depreciation / CR Acc. Dep." },
];

export default function MonthEndCloser() {
  const done = checklist.filter(c => c.done).length;
  const pct = Math.round((done / checklist.length) * 100);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Month-End Closer — May 2026</h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          ["Progress", `${done} / ${checklist.length} tasks`],
          ["Accruals Posted", "KWD 536,150"],
          ["Status", "In Progress"],
          ["Period", "May 2026"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-lg font-bold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Close Checklist</span>
            <span className="text-xs text-gray-500">{pct}% complete</span>
          </div>
          <div className="px-5 py-2 mb-2">
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <ul className="px-5 pb-4 space-y-2">
            {checklist.map(c => (
              <li key={c.task} className="flex items-start gap-2 text-sm">
                <span className={c.done ? "text-green-500 mt-0.5" : "text-gray-300 mt-0.5"}>
                  {c.done ? "✓" : "○"}
                </span>
                <span className={c.done ? "text-gray-500 line-through" : "text-gray-700"}>{c.task}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Accrual schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Accrual Schedule</span>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Description","Reference","Amount","JE"].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accruals.map(a => (
                <tr key={a.desc} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{a.desc}</td>
                  <td className="px-4 py-2 text-gray-500">{a.ref}</td>
                  <td className="px-4 py-2 font-medium">{a.amount}</td>
                  <td className="px-4 py-2 text-gray-400 font-mono text-xs">{a.je}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AgentPanel
        agent="month-end-closer"
        defaultPrompt="Run the May 2026 month-end close for the F&B coffee shop group. Show the close checklist status, post remaining accruals (prepayment amortisation, intercompany eliminations), and generate P&L variance commentary vs prior month and budget."
      />
    </div>
  );
}
