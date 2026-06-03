"use client";

const shortfalls = [
  { sku: "OAT-MILK-1L", description: "Oat Milk 1L", location: "Clerkenwell", qty: 4, par: 48, days: 0.8, tier: "CRITICAL", supplier: "Coco Supplies", reorder: 96 },
  { sku: "COFFEE-BEANS-1KG", description: "Arabica Beans 1kg", location: "JBR Branch", qty: 2, par: 30, days: 0.5, tier: "CRITICAL", supplier: "Bean Origin Co", reorder: 60 },
  { sku: "PAPER-CUPS-8OZ", description: "Paper Cups 8oz (sleeve)", location: "Downtown", qty: 6, par: 50, days: 1.2, tier: "CRITICAL", supplier: "PackRight", reorder: 100 },
  { sku: "ALMOND-MILK-1L", description: "Almond Milk 1L", location: "Marina", qty: 10, par: 36, days: 2.1, tier: "HIGH", supplier: "Coco Supplies", reorder: 52 },
  { sku: "SUGAR-SYRUP-1L", description: "Vanilla Syrup 1L", location: "DIFC", qty: 8, par: 24, days: 2.8, tier: "HIGH", supplier: "FlavorHouse", reorder: 32 },
  { sku: "COLD-BREW-CONC", description: "Cold Brew Concentrate", location: "Jumeirah", qty: 14, par: 30, days: 3.5, tier: "HIGH", supplier: "Bean Origin Co", reorder: 20 },
  { sku: "NAPKINS-PACK", description: "Napkins 500pk", location: "JBR Branch", qty: 18, par: 40, days: 3.6, tier: "HIGH", supplier: "PackRight", reorder: 24 },
  { sku: "LIDS-12OZ", description: "Lids 12oz (sleeve)", location: "Marina", qty: 20, par: 50, days: 4.0, tier: "HIGH", supplier: "PackRight", reorder: 36 },
  { sku: "WHOLE-MILK-2L", description: "Whole Milk 2L", location: "Downtown", qty: 22, par: 40, days: 5.5, tier: "HIGH", supplier: "DairyDirect", reorder: 28 },
  { sku: "DECAF-BEANS-1KG", description: "Decaf Beans 1kg", location: "DIFC", qty: 10, par: 20, days: 5.0, tier: "MEDIUM", supplier: "Bean Origin Co", reorder: 12 },
];

const tierColors: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-amber-100 text-amber-700",
  MEDIUM: "bg-blue-100 text-blue-700",
};

export default function InventoryMonitor() {
  const critical = shortfalls.filter(s => s.tier === "CRITICAL");
  const high = shortfalls.filter(s => s.tier === "HIGH");
  const medium = shortfalls.filter(s => s.tier === "MEDIUM");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Inventory Monitor</h1>
        <p className="text-sm text-gray-500">Stock check: 20/05/2026 — 5 locations — All SKUs</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "SKUs Checked", value: "142", sub: "Across 5 locations" },
          { label: "Critical", value: critical.length, sub: "Same-day order", highlight: "red" },
          { label: "High Priority", value: high.length, sub: "Order today", highlight: "amber" },
          { label: "Medium", value: medium.length, sub: "Within 24 hrs", highlight: "blue" },
        ].map((k) => (
          <div key={k.label} className={`bg-white rounded border p-4 ${k.highlight === "red" ? "border-red-200" : k.highlight === "amber" ? "border-amber-200" : "border-gray-200"}`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.highlight === "red" ? "text-red-600" : k.highlight === "amber" ? "text-amber-600" : "text-gray-800"}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Shortfall table */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Shortfall Ranking</h2>
          <div className="flex gap-2">
            <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">Trigger Critical Orders</button>
            <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">Export Reorder List</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">SKU</th>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Location</th>
              <th className="px-4 py-2 font-medium">On Hand</th>
              <th className="px-4 py-2 font-medium">Par Level</th>
              <th className="px-4 py-2 font-medium">Days Left</th>
              <th className="px-4 py-2 font-medium">Supplier</th>
              <th className="px-4 py-2 font-medium">Reorder Qty</th>
              <th className="px-4 py-2 font-medium">Urgency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shortfalls.map((s) => (
              <tr key={`${s.sku}-${s.location}`} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{s.sku}</td>
                <td className="px-4 py-2.5 text-gray-700">{s.description}</td>
                <td className="px-4 py-2.5 text-blue-600">{s.location}</td>
                <td className={`px-4 py-2.5 font-medium ${s.tier === "CRITICAL" ? "text-red-600" : "text-gray-700"}`}>{s.qty}</td>
                <td className="px-4 py-2.5 text-gray-500">{s.par}</td>
                <td className={`px-4 py-2.5 font-medium ${s.days <= 1 ? "text-red-600" : s.days <= 2 ? "text-amber-600" : "text-gray-700"}`}>{s.days}d</td>
                <td className="px-4 py-2.5 text-gray-500">{s.supplier}</td>
                <td className="px-4 py-2.5 text-gray-700">{s.reorder}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${tierColors[s.tier]}`}>{s.tier}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 flex gap-4">
          <a href="#" className="text-xs text-blue-600 hover:underline">View Full Stock Report</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">View Aged Payables</a>
        </div>
      </div>
    </div>
  );
}
