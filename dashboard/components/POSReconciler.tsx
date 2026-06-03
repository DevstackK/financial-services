"use client";
import AgentPanel from "./AgentPanel";

const locations = [
  { name: "JBR", pos: 18420, cash: 18390, variance: -30, status: "OK" },
  { name: "Downtown", pos: 22150, cash: 21980, variance: -170, status: "FLAG" },
  { name: "Marina", pos: 15800, cash: 15820, variance: 20, status: "OK" },
  { name: "Jumeirah", pos: 19600, cash: 19600, variance: 0, status: "OK" },
  { name: "DIFC", pos: 31200, cash: 31140, variance: -60, status: "FLAG" },
];

export default function POSReconciler() {
  const balanced = locations.filter(l => l.status === "OK").length;
  const flagged = locations.filter(l => l.status === "FLAG").length;
  const totalSales = locations.reduce((s, l) => s + l.pos, 0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">POS Reconciler</h2>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          ["Total Net Sales", `KWD ${totalSales.toLocaleString()}`],
          ["Locations Balanced", `${balanced} / ${locations.length}`],
          ["Variances Flagged", flagged.toString()],
          ["Last Run", "Today 08:14"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-lg font-bold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      {/* Reconciliation table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Daily Reconciliation — 3 Jun 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Location","POS Total (KWD)","Cash Count (KWD)","Variance (KWD)","Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locations.map(l => (
                <tr key={l.name} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{l.name}</td>
                  <td className="px-5 py-3">{l.pos.toLocaleString()}</td>
                  <td className="px-5 py-3">{l.cash.toLocaleString()}</td>
                  <td className={`px-5 py-3 font-medium ${l.variance < 0 ? "text-red-600" : l.variance > 0 ? "text-amber-600" : "text-gray-500"}`}>
                    {l.variance > 0 ? "+" : ""}{l.variance}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${l.status === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {l.status === "OK" ? "✓ Balanced" : "⚠ Flagged"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AgentPanel
        agent="pos-reconciler"
        defaultPrompt="Run today's reconciliation for all 5 locations. Flag any variances above KWD 50 as HIGH severity."
        acceptFiles=".csv,.txt,.xlsx"
        fileLabel="Upload cash-up sheet:"
      />
    </div>
  );
}
