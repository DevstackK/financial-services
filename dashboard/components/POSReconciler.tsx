"use client";
import { useEffect, useState } from "react";
import AgentPanel from "./AgentPanel";
import type { POSDataResponse, POSLocation } from "@/app/api/sapaad/pos-data/route";

const FLAG_THRESHOLD = 20;

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

export default function POSReconciler() {
  const [data, setData] = useState<POSDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sapaad/pos-data")
      .then(async res => {
        const json = await res.json();
        // If API errored but returned a fallback, use that
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
  }, []);

  const locations: POSLocation[] = data?.locations ?? [];
  const balanced   = locations.filter(l => l.status === "OK").length;
  const flagged    = locations.filter(l => l.status === "FLAG").length;
  const totalSales = locations.reduce((s, l) => s + l.pos, 0);

  // Build prompt with live data injected so the agent has real numbers
  const agentPrompt = data
    ? `Run today's POS reconciliation for ${data.date} (${data.currency}).

Branch data from Sapaad (${data.live ? "LIVE" : "DEMO"}):
${locations.map(l =>
  `- ${l.name}: POS net sales ${l.pos} ${data.currency}, cash counted ${l.cash} ${data.currency}, ` +
  `variance ${l.variance > 0 ? "+" : ""}${l.variance} ${data.currency}, ` +
  `voids ${l.voids}, refunds ${l.refunds}, orders ${l.orders}`
).join("\n")}

Flag variances above ${FLAG_THRESHOLD} ${data.currency} as HIGH severity. Explain likely causes for any flagged branches.`
    : "Run today's reconciliation for all locations. Flag variances above KWD 20 as HIGH severity.";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">POS Reconciler</h2>
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
            ["Total Net Sales",      `KWD ${totalSales.toLocaleString()}`],
            ["Locations Balanced",   `${balanced} / ${locations.length}`],
            ["Variances Flagged",    flagged.toString()],
            ["Date",                 data?.date ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{k}</p>
              <p className="text-lg font-bold text-gray-900">{v}</p>
            </div>
          ))
        )}
      </div>

      {/* Reconciliation table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Daily Reconciliation — {data?.date ?? "Loading…"}
          </span>
          {!loading && (
            <button
              onClick={() => { setLoading(true); fetch("/api/sapaad/pos-data").then(r => r.json()).then(setData).finally(() => setLoading(false)); }}
              className="text-xs text-indigo-600 hover:underline"
            >
              ↺ Refresh
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Location", "POS Net (KWD)", "Cash (KWD)", "Card (KWD)", "Voids", "Refunds", "Variance (KWD)", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No data returned from Sapaad for this date</td>
                </tr>
              ) : (
                locations.map(l => (
                  <tr key={l.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{l.name}</td>
                    <td className="px-5 py-3">{l.pos.toLocaleString()}</td>
                    <td className="px-5 py-3">{l.cash.toLocaleString()}</td>
                    <td className="px-5 py-3">{l.card.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{l.voids.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{l.refunds.toLocaleString()}</td>
                    <td className={`px-5 py-3 font-medium ${l.variance < 0 ? "text-red-600" : l.variance > 0 ? "text-amber-600" : "text-gray-500"}`}>
                      {l.variance > 0 ? "+" : ""}{l.variance}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${l.status === "OK" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {l.status === "OK" ? "✓ Balanced" : "⚠ Flagged"}
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
        agent="pos-reconciler"
        defaultPrompt={agentPrompt}
        promptKey={data?.date}
        acceptFiles=".csv,.txt,.xlsx"
        fileLabel="Upload cash-up sheet:"
      />
    </div>
  );
}
