"use client";

const orders = [
  { ref: "ORD-2026-0520-0001", supplier: "Coco Supplies", items: 3, sent: "2026-05-20 05:12", delivery: "2026-05-20", status: "confirmed", whatsapp: "+971501234567" },
  { ref: "ORD-2026-0520-0002", supplier: "Bean Origin Co", items: 2, sent: "2026-05-20 05:14", delivery: "2026-05-20", status: "overdue", whatsapp: "+971509876543" },
  { ref: "ORD-2026-0520-0003", supplier: "PackRight", items: 4, sent: "2026-05-20 05:15", delivery: "2026-05-21", status: "sent", whatsapp: "+971507654321" },
  { ref: "ORD-2026-0519-0001", supplier: "DairyDirect", items: 2, sent: "2026-05-19 06:00", delivery: "2026-05-20", status: "delivered", whatsapp: "+971506543210" },
  { ref: "ORD-2026-0519-0002", supplier: "FlavorHouse", items: 1, sent: "2026-05-19 06:05", delivery: "2026-05-20", status: "confirmed", whatsapp: "+971504321098" },
  { ref: "ORD-2026-0519-0003", supplier: "Coco Supplies", items: 2, sent: "2026-05-19 06:10", delivery: "2026-05-20", status: "delivered", whatsapp: "+971501234567" },
  { ref: "ORD-2026-0518-0001", supplier: "Bean Origin Co", items: 3, sent: "2026-05-18 05:55", delivery: "2026-05-19", status: "amended", whatsapp: "+971509876543" },
  { ref: "ORD-2026-0518-0002", supplier: "PackRight", items: 5, sent: "2026-05-18 06:01", delivery: "2026-05-19", status: "delivered", whatsapp: "+971507654321" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  sent: "bg-amber-100 text-amber-700",
  amended: "bg-purple-100 text-purple-700",
};

export default function SupplierOrderAgent() {
  const overdue = orders.filter(o => o.status === "overdue").length;
  const pending = orders.filter(o => o.status === "sent").length;
  const confirmed = orders.filter(o => ["confirmed", "delivered"].includes(o.status)).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Supplier Order Agent</h1>
        <p className="text-sm text-gray-500">WhatsApp Business API — Purchase order lifecycle management</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Orders Sent (7 days)", value: orders.length, sub: "Across all suppliers" },
          { label: "Overdue (>24 hrs)", value: overdue, sub: "Need follow-up", highlight: "red" },
          { label: "Awaiting Confirmation", value: pending, sub: "Within SLA", highlight: "amber" },
          { label: "Confirmed / Delivered", value: confirmed, sub: "On track" },
        ].map((k) => (
          <div key={k.label} className={`bg-white rounded border p-4 ${k.highlight === "red" ? "border-red-200" : k.highlight === "amber" ? "border-amber-200" : "border-gray-200"}`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.highlight === "red" ? "text-red-600" : k.highlight === "amber" ? "text-amber-600" : "text-gray-800"}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-sm font-semibold text-red-700">Overdue Orders — Action Required</p>
          {orders.filter(o => o.status === "overdue").map(o => (
            <div key={o.ref} className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">{o.ref} — {o.supplier}</p>
                <p className="text-xs text-gray-500">Sent {o.sent} · {o.items} items · No confirmation received</p>
              </div>
              <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">Resend via WhatsApp</button>
            </div>
          ))}
        </div>
      )}

      {/* Order log */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Order Log</h2>
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">New Order</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-2 font-medium">Order Ref</th>
              <th className="px-4 py-2 font-medium">Supplier</th>
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Sent At</th>
              <th className="px-4 py-2 font-medium">Requested Delivery</th>
              <th className="px-4 py-2 font-medium">WhatsApp</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.ref} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{o.ref}</td>
                <td className="px-4 py-2.5 text-gray-700">{o.supplier}</td>
                <td className="px-4 py-2.5 text-gray-500">{o.items} SKUs</td>
                <td className="px-4 py-2.5 text-gray-500">{o.sent}</td>
                <td className="px-4 py-2.5 text-gray-500">{o.delivery}</td>
                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{o.whatsapp}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[o.status]}`}>
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 border-t border-gray-100 flex gap-4">
          <a href="#" className="text-xs text-blue-600 hover:underline">View Supplier List</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">Amendments Pending</a>
          <a href="#" className="text-xs text-blue-600 hover:underline">Export Order Log</a>
        </div>
      </div>
    </div>
  );
}
