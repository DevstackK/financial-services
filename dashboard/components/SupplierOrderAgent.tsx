"use client";
import AgentPanel from "./AgentPanel";

const orders = [
  { ref: "ORD-0841", supplier: "Gulf Roasters LLC", items: "Arabica Blend 1kg × 50", value: "AED 3,250", sent: "1 Jun 09:00", status: "overdue" },
  { ref: "ORD-0842", supplier: "Emirates Dairy Co", items: "Oat Milk 1L × 200", value: "AED 1,800", sent: "1 Jun 09:05", status: "overdue" },
  { ref: "ORD-0843", supplier: "Al Noor Packaging", items: "Takeaway Cups 12oz × 5000", value: "AED 2,100", sent: "2 Jun 08:30", status: "sent" },
  { ref: "ORD-0844", supplier: "Flavour House FZCO", items: "Vanilla Syrup × 24", value: "AED 960", sent: "2 Jun 10:00", status: "confirmed" },
  { ref: "ORD-0839", supplier: "Gulf Roasters LLC", items: "Decaf Blend 1kg × 20", value: "AED 1,400", sent: "30 May", status: "delivered" },
  { ref: "ORD-0838", supplier: "Emirates Dairy Co", items: "Almond Milk 1L × 100", value: "AED 750", sent: "29 May", status: "delivered" },
];

const statusStyle: Record<string, string> = {
  overdue: "bg-red-100 text-red-700",
  sent: "bg-blue-50 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-600",
};

export default function SupplierOrderAgent() {
  const overdue = orders.filter(o => o.status === "overdue").length;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Supplier Order Agent</h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          ["Overdue Orders", overdue.toString()],
          ["Sent (Pending)", orders.filter(o => o.status === "sent").length.toString()],
          ["Confirmed Today", orders.filter(o => o.status === "confirmed").length.toString()],
          ["Last Dispatch", "Today 10:00"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-lg font-bold text-gray-900">{v}</p>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-red-700 mb-1">⚠ {overdue} orders overdue — no confirmation after 48h</p>
          <p className="text-xs text-red-600">Gulf Roasters LLC · Emirates Dairy Co — click Run Now below to chase via WhatsApp</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Order Log</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Ref","Supplier","Items","Value","Sent","Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(o => (
                <tr key={o.ref} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.ref}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{o.supplier}</td>
                  <td className="px-5 py-3 text-gray-600">{o.items}</td>
                  <td className="px-5 py-3">{o.value}</td>
                  <td className="px-5 py-3 text-gray-400">{o.sent}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[o.status]}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AgentPanel
        agent="supplier-order-agent"
        defaultPrompt="Check overdue orders for Gulf Roasters LLC and Emirates Dairy Co. Draft WhatsApp follow-up messages and generate a new purchase order for the CRITICAL SKUs: Arabica Blend 50kg, Oat Milk 200L, Takeaway Cups 5000 units."
      />
    </div>
  );
}
