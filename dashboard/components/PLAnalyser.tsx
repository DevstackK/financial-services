"use client";
import AgentPanel from "./AgentPanel";

const insights = [
  {
    label: "Cost of Goods Sold",
    value: "38%",
    benchmark: "28–35%",
    status: "red",
    note: "3% above benchmark — likely over-ordering and wastage",
  },
  {
    label: "Labour Cost",
    value: "31%",
    benchmark: "25–30%",
    status: "red",
    note: "Overstaffed during off-peak hours",
  },
  {
    label: "Rent & Occupancy",
    value: "14%",
    benchmark: "8–12%",
    status: "red",
    note: "DIFC location dragging average up significantly",
  },
  {
    label: "Utilities",
    value: "4%",
    benchmark: "3–5%",
    status: "ok",
    note: "Within range",
  },
  {
    label: "Gross Profit Margin",
    value: "62%",
    benchmark: "65–72%",
    status: "amber",
    note: "Below target — recover via COGS and labour",
  },
  {
    label: "Net Profit Margin",
    value: "7%",
    benchmark: "10–15%",
    status: "red",
    note: "Well below healthy F&B net margin",
  },
];

const statusStyle: Record<string, string> = {
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  ok: "bg-green-100 text-green-700",
};

const statusLabel: Record<string, string> = {
  red: "⚠ Above benchmark",
  amber: "~ Watch",
  ok: "✓ On target",
};

export default function PLAnalyser() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">P&L Analyser</h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload your bank statement or export and the agent will identify where you&apos;re losing money, why, and how to fix it.
      </p>


      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          ["Period", "May 2026"],
          ["Total Revenue", "KWD 32,400"],
          ["Net Profit", "KWD 2,268"],
          ["Net Margin", "7% ⚠"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-lg font-bold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      {/* Benchmark table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Cost Benchmark Analysis</span>
          <span className="ml-2 text-xs text-gray-400">vs F&B industry averages</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Category", "Your %", "Benchmark", "Status", "Finding"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {insights.map(i => (
                <tr key={i.label} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{i.label}</td>
                  <td className={`px-5 py-3 font-bold ${i.status === "red" ? "text-red-600" : i.status === "amber" ? "text-amber-600" : "text-green-600"}`}>
                    {i.value}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{i.benchmark}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[i.status]}`}>
                      {statusLabel[i.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{i.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key loss areas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          {
            icon: "📦",
            title: "Wastage & Over-ordering",
            amount: "~KWD 970/mo",
            action: "Match orders to 7-day sales forecasts; daily wastage log per location",
          },
          {
            icon: "👥",
            title: "Labour Inefficiency",
            amount: "~KWD 648/mo",
            action: "Shift scheduling audit — reduce off-peak headcount by 1 per location",
          },
          {
            icon: "🏢",
            title: "High-Rent Location",
            amount: "~KWD 810/mo excess",
            action: "DIFC rent-to-revenue ratio is 18% — renegotiate or review viability",
          },
        ].map(c => (
          <div key={c.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{c.title}</p>
            <p className="text-base font-bold text-red-600 mb-2">{c.amount}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{c.action}</p>
          </div>
        ))}
      </div>

      <AgentPanel
        agent="pl-analyser"
        defaultPrompt="Analyse my bank statement and tell me exactly where I am losing money, why it is happening, and give me specific actions to improve profitability. Be direct and give me KWD figures."
        acceptFiles=".csv,.txt,.pdf,.xlsx,.xls"
        fileLabel="Upload bank statement or P&L export:"
      />
    </div>
  );
}
