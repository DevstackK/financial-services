"use client";

import { useState } from "react";
import POSReconciler from "@/components/POSReconciler";
import InventoryMonitor from "@/components/InventoryMonitor";
import SupplierOrderAgent from "@/components/SupplierOrderAgent";
import MonthEndCloser from "@/components/MonthEndCloser";

const NAV = [
  { id: "dashboard", label: "My Dashboard" },
  { id: "pos", label: "POS Reconciler" },
  { id: "inventory", label: "Inventory Monitor" },
  { id: "supplier", label: "Supplier Orders" },
  { id: "monthend", label: "Month-End Closer" },
];

export default function Home() {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coffee Shops</p>
          <p className="text-sm font-bold text-gray-800 mt-0.5">F&B Operations</p>
        </div>
        <nav className="flex-1 py-2">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                active === item.id
                  ? "bg-gray-100 text-gray-900 font-semibold border-l-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">Powered by Claude AI</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          {["Refresh", "Default", "Customize", "Print", "Add"].map((a) => (
            <button key={a} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1">
              {a}
            </button>
          ))}
        </header>

        <div className="p-6">
          {active === "dashboard" && <DashboardOverview setActive={setActive} />}
          {active === "pos" && <POSReconciler />}
          {active === "inventory" && <InventoryMonitor />}
          {active === "supplier" && <SupplierOrderAgent />}
          {active === "monthend" && <MonthEndCloser />}
        </div>
      </main>
    </div>
  );
}

function DashboardOverview({ setActive }: { setActive: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">20/05/2026 — All Locations</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* POS Reconciler summary */}
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold text-gray-800">POS Reconciler</h2>
            <StatusBadge status="2 variances" color="yellow" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-1 font-medium">Location</th>
                <th className="pb-1 font-medium">Net Sales</th>
                <th className="pb-1 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { loc: "JBR Branch", sales: "AED 4,821", status: "balanced" },
                { loc: "Downtown", sales: "AED 3,142", status: "variance" },
                { loc: "Marina", sales: "AED 5,390", status: "balanced" },
                { loc: "Jumeirah", sales: "AED 2,870", status: "variance" },
                { loc: "DIFC", sales: "AED 6,104", status: "balanced" },
              ].map((r) => (
                <tr key={r.loc} className="hover:bg-gray-50">
                  <td className="py-1.5 text-blue-600">{r.loc}</td>
                  <td className="py-1.5 text-gray-700">{r.sales}</td>
                  <td className="py-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${r.status === "balanced" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-4">
            <button onClick={() => setActive("pos")} className="text-xs text-blue-600 hover:underline">View Full Report</button>
            <button className="text-xs text-blue-600 hover:underline">Run Reconciliation</button>
          </div>
        </div>

        {/* Inventory Monitor summary */}
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold text-gray-800">Inventory Monitor</h2>
            <StatusBadge status="3 critical" color="red" />
          </div>
          <div className="flex gap-4">
            <DonutChart
              segments={[
                { value: 3, color: "#ef4444" },
                { value: 7, color: "#f59e0b" },
                { value: 12, color: "#22c55e" },
              ]}
              total={22}
            />
            <div className="flex-1 space-y-1.5 self-center">
              {[
                { label: "Critical", count: 3, color: "bg-red-500", value: "Same-day order" },
                { label: "High", count: 7, color: "bg-amber-400", value: "Order today" },
                { label: "OK", count: 12, color: "bg-green-500", value: "No action" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-gray-600 w-14">{s.label}</span>
                  <span className="font-semibold text-gray-800 w-4">{s.count}</span>
                  <span className="text-xs text-gray-400">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-4">
            <button onClick={() => setActive("inventory")} className="text-xs text-blue-600 hover:underline">View Shortfalls</button>
            <button className="text-xs text-blue-600 hover:underline">Trigger Reorder</button>
          </div>
        </div>

        {/* Supplier Orders summary */}
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold text-gray-800">Supplier Orders</h2>
            <StatusBadge status="1 overdue" color="red" />
          </div>
          <div className="flex gap-4">
            <DonutChart
              segments={[
                { value: 1, color: "#ef4444" },
                { value: 3, color: "#f59e0b" },
                { value: 8, color: "#22c55e" },
              ]}
              total={12}
            />
            <div className="flex-1 space-y-1.5 self-center">
              {[
                { label: "Overdue", count: 1, color: "bg-red-500", value: ">24 hrs" },
                { label: "Pending", count: 3, color: "bg-amber-400", value: "Awaiting confirm" },
                { label: "Confirmed", count: 8, color: "bg-green-500", value: "On track" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-gray-600 w-16">{s.label}</span>
                  <span className="font-semibold text-gray-800 w-4">{s.count}</span>
                  <span className="text-xs text-gray-400">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-4">
            <button onClick={() => setActive("supplier")} className="text-xs text-blue-600 hover:underline">View Orders</button>
            <button className="text-xs text-blue-600 hover:underline">Send New Order</button>
          </div>
        </div>

        {/* Month-End Closer summary */}
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold text-gray-800">Month-End Closer</h2>
            <StatusBadge status="In progress" color="blue" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">Period: May 2026</p>
            {[
              { task: "Trial Balance pulled", done: true },
              { task: "Accrual schedules", done: true },
              { task: "Roll-forward schedules", done: true },
              { task: "Variance commentary", done: false },
              { task: "Controller sign-off", done: false },
            ].map((t) => (
              <div key={t.task} className="flex items-center gap-2 text-sm">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${t.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {t.done ? "✓" : ""}
                </span>
                <span className={t.done ? "text-gray-500 line-through" : "text-gray-700"}>{t.task}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4">
            <button onClick={() => setActive("monthend")} className="text-xs text-blue-600 hover:underline">View Close Package</button>
            <button className="text-xs text-blue-600 hover:underline">Resume Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, color }: { status: string; color: "red" | "yellow" | "green" | "blue" }) {
  const cls = {
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
  }[color];
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>{status}</span>;
}

function DonutChart({ segments, total }: { segments: { value: number; color: string }[]; total: number }) {
  const size = 80;
  const cx = size / 2;
  const cy = size / 2;
  const r = 28;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = (offset / total) * 360 - 90;
    offset += seg.value;
    return { dash, gap, rotation, color: seg.color };
  });

  return (
    <svg width={size} height={size} className="shrink-0">
      {paths.map((p, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={p.color}
          strokeWidth={14}
          strokeDasharray={`${p.dash} ${p.gap}`}
          transform={`rotate(${p.rotation} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={21} fill="white" />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#374151">{total}</text>
    </svg>
  );
}
