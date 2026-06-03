"use client";
import AgentPanel from "./AgentPanel";

const skus = [
  { sku: "Arabica Blend 1kg", onHand: 8, par: 40, daysLeft: 1.2, tier: "CRITICAL" },
  { sku: "Oat Milk 1L", onHand: 24, par: 80, daysLeft: 1.8, tier: "CRITICAL" },
  { sku: "Takeaway Cups 12oz", onHand: 320, par: 1000, daysLeft: 1.9, tier: "CRITICAL" },
  { sku: "Vanilla Syrup 750ml", onHand: 6, par: 20, daysLeft: 3.5, tier: "HIGH" },
  { sku: "Cold Brew Concentrate", onHand: 10, par: 30, daysLeft: 4.0, tier: "HIGH" },
  { sku: "Decaf Blend 1kg", onHand: 15, par: 30, daysLeft: 6.0, tier: "MEDIUM" },
  { sku: "Almond Milk 1L", onHand: 30, par: 60, daysLeft: 7.5, tier: "MEDIUM" },
  { sku: "Cardamom Ground", onHand: 4, par: 8, daysLeft: 8.0, tier: "MEDIUM" },
  { sku: "Paper Straws", onHand: 800, par: 1500, daysLeft: 10.0, tier: "MEDIUM" },
  { sku: "Sanitiser 5L", onHand: 12, par: 20, daysLeft: 14.0, tier: "OK" },
];

const tierColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-amber-100 text-amber-700",
  MEDIUM: "bg-yellow-50 text-yellow-700",
  OK: "bg-green-100 text-green-700",
};

export default function InventoryMonitor() {
  const critical = skus.filter(s => s.tier === "CRITICAL").length;
  const high = skus.filter(s => s.tier === "HIGH").length;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Monitor</h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          ["Critical SKUs", critical.toString()],
          ["High Priority", high.toString()],
          ["Total SKUs Tracked", skus.length.toString()],
          ["Last Check", "Today 07:00"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-lg font-bold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Shortfall Ranking — All Locations</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["SKU","On Hand","Par Level","Days Left","Urgency"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {skus.map(s => (
                <tr key={s.sku} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{s.sku}</td>
                  <td className="px-5 py-3">{s.onHand}</td>
                  <td className="px-5 py-3">{s.par}</td>
                  <td className={`px-5 py-3 font-medium ${s.daysLeft <= 2 ? "text-red-600" : s.daysLeft <= 5 ? "text-amber-600" : "text-gray-700"}`}>
                    {s.daysLeft}d
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColor[s.tier]}`}>
                      {s.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AgentPanel
        agent="inventory-monitor"
        defaultPrompt="Run a full stock check across all locations. List CRITICAL and HIGH items with days of stock remaining and generate a reorder list grouped by supplier."
        acceptFiles=".csv,.txt,.xlsx"
        fileLabel="Upload stock count sheet:"
      />
    </div>
  );
}
