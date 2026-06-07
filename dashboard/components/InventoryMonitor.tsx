"use client";
import { useEffect, useState } from "react";
import AgentPanel from "./AgentPanel";
import type { InventoryDataResponse, StockLine, UrgencyTier } from "@/app/api/sapaad/inventory-data/route";

const tierColor: Record<UrgencyTier, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH:     "bg-amber-100 text-amber-700",
  MEDIUM:   "bg-yellow-50 text-yellow-700",
  OK:       "bg-green-100 text-green-700",
};

function LiveBadge({ live }: { live: boolean }) {
  return live ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Live · Sapaad
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      Demo data — add SAPAAD_API_KEY to go live
    </span>
  );
}

function FillBar({ pct }: { pct: number }) {
  const colour = pct <= 0.15 ? "bg-red-400" : pct <= 0.35 ? "bg-amber-400" : pct <= 0.60 ? "bg-yellow-300" : "bg-green-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colour}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(pct * 100)}%</span>
    </div>
  );
}

export default function InventoryMonitor() {
  const [data, setData] = useState<InventoryDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch("/api/sapaad/inventory-data")
      .then(async res => {
        const json = await res.json();
        if (!res.ok && json.fallback) {
          setData(json.fallback);
          setFetchError(json.error);
        } else if (!res.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`);
        } else {
          setData(json);
        }
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const items: StockLine[] = data?.items ?? [];
  const critical = items.filter(s => s.tier === "CRITICAL").length;
  const high      = items.filter(s => s.tier === "HIGH").length;
  const asOf      = data?.asOf ? new Date(data.asOf).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  // Build agent prompt with real stock data injected
  const agentPrompt = data
    ? `Run a full stock check. Data from Sapaad (${data.live ? "LIVE" : "DEMO"}) as of ${data.asOf}:

${items.map(s =>
  `- ${s.sku} (${s.category}): on-hand ${s.onHand} ${s.unit}, par ${s.par} ${s.unit}, fill ${Math.round(s.fillPct * 100)}%` +
  (s.daysLeft ? `, ~${s.daysLeft}d remaining` : "") +
  ` → ${s.tier}`
).join("\n")}

List all CRITICAL and HIGH items with urgency reasoning. Generate a reorder list grouped by category with suggested order quantities to reach 100% of par level.`
    : "Run a full stock check across all locations. List CRITICAL and HIGH items and generate a reorder list grouped by supplier.";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Inventory Monitor</h2>
        {data && <LiveBadge live={data.live} />}
      </div>

      {fetchError && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          ⚠ Sapaad API error: {fetchError} — showing last known data
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : (
          [
            ["Critical SKUs",      critical.toString()],
            ["High Priority",      high.toString()],
            ["Total SKUs Tracked", items.length.toString()],
            ["As of",              asOf],
          ].map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{k}</p>
              <p className="text-lg font-bold text-gray-900">{v}</p>
            </div>
          ))
        )}
      </div>

      {/* Stock table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Shortfall Ranking — All Locations</span>
          {!loading && (
            <button onClick={loadData} className="text-xs text-indigo-600 hover:underline">↺ Refresh</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["SKU", "Category", "On Hand", "Par Level", "Fill %", "Days Left", "Urgency"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No inventory data returned from Sapaad</td>
                </tr>
              ) : (
                items.map(s => (
                  <tr key={s.sku} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.sku}</td>
                    <td className="px-5 py-3 text-gray-500">{s.category}</td>
                    <td className="px-5 py-3">{s.onHand} <span className="text-gray-400 text-xs">{s.unit}</span></td>
                    <td className="px-5 py-3">{s.par} <span className="text-gray-400 text-xs">{s.unit}</span></td>
                    <td className="px-5 py-3 w-36"><FillBar pct={s.fillPct} /></td>
                    <td className={`px-5 py-3 font-medium ${s.daysLeft !== null && s.daysLeft <= 2 ? "text-red-600" : s.daysLeft !== null && s.daysLeft <= 5 ? "text-amber-600" : "text-gray-700"}`}>
                      {s.daysLeft !== null ? `${s.daysLeft}d` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColor[s.tier]}`}>
                        {s.tier}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AgentPanel
        agent="inventory-monitor"
        defaultPrompt={agentPrompt}
        promptKey={data?.asOf}
        acceptFiles=".csv,.txt,.xlsx"
        fileLabel="Upload stock count sheet:"
      />
    </div>
  );
}
