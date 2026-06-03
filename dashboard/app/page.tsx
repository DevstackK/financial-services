"use client";
import { useState } from "react";
import POSReconciler from "@/components/POSReconciler";
import InventoryMonitor from "@/components/InventoryMonitor";
import SupplierOrderAgent from "@/components/SupplierOrderAgent";
import MonthEndCloser from "@/components/MonthEndCloser";
import PLAnalyser from "@/components/PLAnalyser";

const NAV = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "pos-reconciler", label: "POS Reconciler", icon: "⊜" },
  { id: "inventory-monitor", label: "Inventory Monitor", icon: "▤" },
  { id: "supplier-order-agent", label: "Supplier Orders", icon: "◫" },
  { id: "month-end-closer", label: "Month-End Close", icon: "◉" },
  { id: "pl-analyser", label: "P&L Analyser", icon: "◈" },
];

function DonutChart({ pct, color }: { pct: number; color: string }) {
  const r = 30, cx = 40, cy = 40, circ = 2 * Math.PI * r;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="600" fill="#111">{pct}%</text>
    </svg>
  );
}

function Overview({ setTab }: { setTab: (t: string) => void }) {
  const cards = [
    { id: "pos-reconciler", label: "POS Reconciler", pct: 80, color: "#6366f1", stat: "4/5 balanced", sub: "1 variance flagged" },
    { id: "inventory-monitor", label: "Inventory Monitor", pct: 60, color: "#f59e0b", stat: "3 CRITICAL SKUs", sub: "Reorder needed" },
    { id: "supplier-order-agent", label: "Supplier Orders", pct: 75, color: "#10b981", stat: "2 overdue orders", sub: "WhatsApp pending" },
    { id: "month-end-closer", label: "Month-End Close", pct: 45, color: "#3b82f6", stat: "May 2026 in progress", sub: "7 tasks remaining" },
  ];
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Operations Overview</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.id} onClick={() => setTab(c.id)}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{c.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <DonutChart pct={c.pct} color={c.color} />
              <div>
                <p className="text-lg font-semibold text-gray-900">{c.stat}</p>
                <p className="text-sm text-gray-500">{c.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Summary — 3 Jun 2026</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="text-left pb-2">Agent</th><th className="text-left pb-2">Status</th><th className="text-left pb-2">Last Run</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              ["POS Reconciler","⚠ 1 variance","Today 08:14"],
              ["Inventory Monitor","✗ CRITICAL","Today 07:00"],
              ["Supplier Orders","✓ 2 pending","Today 09:30"],
              ["Month-End Close","⏳ In progress","2 Jun 23:58"],
            ].map(([a,s,t]) => (
              <tr key={a} className="text-gray-700">
                <td className="py-2">{a}</td><td className="py-2">{s}</td><td className="py-2 text-gray-400">{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  const [tab, setTab] = useState("overview");
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-base font-bold text-indigo-600">☕ F&amp;B Ops</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === n.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          F&amp;B Ops · KWD
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        {tab === "overview" && <Overview setTab={setTab} />}
        {tab === "pos-reconciler" && <POSReconciler />}
        {tab === "inventory-monitor" && <InventoryMonitor />}
        {tab === "supplier-order-agent" && <SupplierOrderAgent />}
        {tab === "month-end-closer" && <MonthEndCloser />}
        {tab === "pl-analyser" && <PLAnalyser />}
      </main>
    </div>
  );
}
