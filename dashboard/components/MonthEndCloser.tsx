"use client";

const tasks = [
  { id: 1, task: "Pull trial balance from GL", done: true, completedAt: "2026-05-20 04:00" },
  { id: 2, task: "Build accrual schedules", done: true, completedAt: "2026-05-20 04:22" },
  { id: 3, task: "Roll-forward schedules (BS accounts)", done: true, completedAt: "2026-05-20 05:10" },
  { id: 4, task: "Variance commentary (P&L vs prior + budget)", done: false, completedAt: null },
  { id: 5, task: "Controller review & sign-off", done: false, completedAt: null },
];

const variance = [
  { line: "Revenue", actual: 118420, prior: 104210, budget: 115000, varPrior: 13.6, varBudget: 3.0 },
  { line: "Cost of Goods Sold", actual: -41450, prior: -36480, budget: -40250, varPrior: -13.6, varBudget: -3.0 },
  { line: "Gross Profit", actual: 76970, prior: 67730, budget: 74750, varPrior: 13.6, varBudget: 3.0 },
  { line: "Staff Costs", actual: -28200, prior: -26100, budget: -27000, varPrior: -8.0, varBudget: -4.4 },
  { line: "Rent & Utilities", actual: -11400, prior: -11400, budget: -11400, varPrior: 0, varBudget: 0 },
  { line: "EBITDA", actual: 37370, prior: 30230, budget: 36350, varPrior: 23.6, varBudget: 2.8 },
];

const accruals = [
  { description: "Coffee bean purchases — May delivery (invoice pending)", amount: 8420, account: "5100-00", status: "drafted" },
  { description: "Staff overtime — last 3 days May", amount: 2140, account: "6200-00", status: "drafted" },
  { description: "Maintenance contract — monthly portion", amount: 1250, account: "7300-00", status: "posted" },
  { description: "Marketing retainer — May", amount: 3500, account: "7100-00", status: "posted" },
];

export default function MonthEndCloser() {
  const done = tasks.filter(t => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Month-End Closer</h1>
        <p className="text-sm text-gray-500">Period: May 2026 — Close package for controller sign-off</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Close Progress", value: `${pct}%`, sub: `${done} of ${tasks.length} tasks` },
          { label: "Total Revenue", value: "AED 118,420", sub: "+13.6% vs prior" },
          { label: "EBITDA", value: "AED 37,370", sub: "+23.6% vs prior" },
          { label: "Accruals Drafted", value: accruals.length, sub: `${accruals.filter(a=>a.status==="posted").length} posted` },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Checklist */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Close Checklist</h2>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-500">{pct}%</span>
            </div>
          </div>
          <div className="p-4 space-y-2.5">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${t.done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {t.done ? "✓" : t.id}
                </span>
                <div>
                  <p className={`text-sm ${t.done ? "text-gray-400 line-through" : "text-gray-700 font-medium"}`}>{t.task}</p>
                  {t.completedAt && <p className="text-xs text-gray-400">{t.completedAt}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 mr-2">Resume Close</button>
            <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">Submit for Review</button>
          </div>
        </div>

        {/* Accruals */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Accrual Schedule</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accruals.map((a) => (
                <tr key={a.description} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-700 text-xs">{a.description}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{a.account}</td>
                  <td className="px-4 py-2.5 text-gray-700 font-medium">AED {a.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${a.status === "posted" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variance table */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Variance Commentary — P&L vs Prior Period & Budget</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">Line Item</th>
              <th className="px-4 py-2 font-medium">Actual (May)</th>
              <th className="px-4 py-2 font-medium">Prior Period</th>
              <th className="px-4 py-2 font-medium">Budget</th>
              <th className="px-4 py-2 font-medium">vs Prior %</th>
              <th className="px-4 py-2 font-medium">vs Budget %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variance.map((v) => (
              <tr key={v.line} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-700 font-medium">{v.line}</td>
                <td className="px-4 py-2.5 text-gray-700">AED {Math.abs(v.actual).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-500">AED {Math.abs(v.prior).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-500">AED {Math.abs(v.budget).toLocaleString()}</td>
                <td className={`px-4 py-2.5 font-medium ${v.varPrior > 0 ? "text-green-600" : v.varPrior < 0 ? "text-red-600" : "text-gray-500"}`}>
                  {v.varPrior > 0 ? "+" : ""}{v.varPrior}%
                </td>
                <td className={`px-4 py-2.5 font-medium ${v.varBudget > 0 ? "text-green-600" : v.varBudget < 0 ? "text-red-600" : "text-gray-500"}`}>
                  {v.varBudget > 0 ? "+" : ""}{v.varBudget}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 flex gap-4">
          <a href="#" className="text-xs text-blue-600 hover:underline">View Full P&L</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">View Balance Sheet</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">Export Close Package</a>
        </div>
      </div>
    </div>
  );
}
