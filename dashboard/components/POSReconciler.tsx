"use client";

const locations = [
  { id: "br_001", name: "JBR Branch", pos_total: 4821.00, cash_counted: 612.00, card_total: 3768.00, voids: 95.00, refunds: 37.50, variance: 0.50, status: "balanced" },
  { id: "br_002", name: "Downtown", pos_total: 3142.00, cash_counted: 388.00, card_total: 2680.00, voids: 44.00, refunds: 12.00, variance: -18.00, status: "variance_flagged" },
  { id: "br_003", name: "Marina", pos_total: 5390.00, cash_counted: 820.00, card_total: 4420.00, voids: 110.00, refunds: 60.00, variance: 1.20, status: "balanced" },
  { id: "br_004", name: "Jumeirah", pos_total: 2870.00, cash_counted: 298.00, card_total: 2492.00, voids: 38.00, refunds: 22.00, variance: -52.00, status: "variance_flagged" },
  { id: "br_005", name: "DIFC", pos_total: 6104.00, cash_counted: 940.00, card_total: 4980.00, voids: 148.00, refunds: 44.00, variance: 0.80, status: "balanced" },
];

const summary = {
  total: locations.length,
  balanced: locations.filter(l => l.status === "balanced").length,
  flagged: locations.filter(l => l.status === "variance_flagged").length,
  total_sales: locations.reduce((s, l) => s + l.pos_total, 0),
};

export default function POSReconciler() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">POS Reconciler</h1>
        <p className="text-sm text-gray-500">Business date: 20/05/2026 — Daily cash & card reconciliation via Sapaad API</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Net Sales", value: `AED ${summary.total_sales.toLocaleString()}`, sub: "All locations" },
          { label: "Locations Balanced", value: summary.balanced, sub: `of ${summary.total} locations` },
          { label: "Variances Flagged", value: summary.flagged, sub: "Require review", highlight: summary.flagged > 0 },
          { label: "Last Run", value: "06:14 UTC", sub: "Auto daily close" },
        ].map((k) => (
          <div key={k.label} className={`bg-white rounded border p-4 ${k.highlight ? "border-yellow-300" : "border-gray-200"}`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.highlight ? "text-yellow-600" : "text-gray-800"}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Reconciliation table */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Reconciliation Report</h2>
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Run Now</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">POS Total</th>
              <th className="px-4 py-2 font-medium">Cash Counted</th>
              <th className="px-4 py-2 font-medium">Card</th>
              <th className="px-4 py-2 font-medium">Voids</th>
              <th className="px-4 py-2 font-medium">Refunds</th>
              <th className="px-4 py-2 font-medium">Variance</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-blue-600 font-medium">{loc.name}</td>
                <td className="px-4 py-2.5 text-gray-700">AED {loc.pos_total.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-700">AED {loc.cash_counted.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-700">AED {loc.card_total.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-gray-500">AED {loc.voids.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-gray-500">AED {loc.refunds.toFixed(2)}</td>
                <td className={`px-4 py-2.5 font-medium ${Math.abs(loc.variance) > 2 ? "text-red-600" : "text-green-600"}`}>
                  {loc.variance >= 0 ? "+" : ""}AED {loc.variance.toFixed(2)}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${loc.status === "balanced" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {loc.status === "balanced" ? "Balanced" : "Flagged"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 flex gap-4">
          <a href="#" className="text-xs text-blue-600 hover:underline">View Cash-Up Sheets</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">Export to Month-End Closer</a>
        </div>
      </div>

      {/* Variance detail */}
      <div className="bg-white rounded border border-yellow-200">
        <div className="px-4 py-3 border-b border-yellow-100">
          <h2 className="font-semibold text-gray-800">Variance Detail — Requires Review</h2>
        </div>
        <div className="p-4 space-y-3">
          {locations.filter(l => l.status === "variance_flagged").map(loc => (
            <div key={loc.id} className="flex items-start justify-between bg-yellow-50 rounded p-3">
              <div>
                <p className="font-medium text-gray-800">{loc.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Cash counted AED {Math.abs(loc.variance).toFixed(2)} {loc.variance < 0 ? "short" : "over"} of expected.
                  Suspected cause: <span className="font-medium">{Math.abs(loc.variance) > 50 ? "till theft / unrecorded refund" : "data entry error"}</span>
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${Math.abs(loc.variance) > 50 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {Math.abs(loc.variance) > 50 ? "HIGH" : "LOW"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
