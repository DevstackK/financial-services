"use client";
import { useState } from "react";
import AgentPanel from "./AgentPanel";

const SUPERMARKETS = [
  { name: "Lulu Hypermarket", url: "luluhypermarket.com" },
  { name: "Carrefour Kuwait", url: "carrefourkuwait.com" },
  { name: "The Sultan Center", url: "tsc.com.kw" },
  { name: "Saveco", url: "saveco.com.kw" },
  { name: "Géant Kuwait", url: "geant-kuwait.com" },
  { name: "Al Rawdah Co-op", url: "alrawdah.coop" },
];

const QUICK_PROMPT = `[QUICK SCAN] Search the top Kuwaiti supermarkets for current offers on our 4 CRITICAL SKUs only:

Supermarkets to check (top 3 only):
- Lulu Hypermarket (luluhypermarket.com)
- Carrefour Kuwait (carrefourkuwait.com)
- The Sultan Center (tsc.com.kw)

CRITICAL SKUs to find:
1. Arabica Blend / coffee beans 1kg
2. Oat Milk 1L
3. Takeaway Cups 12oz (or similar)
4. Vanilla Syrup 750ml

For each item found, report: supermarket, product name, price in KWD, and any active promotion. Rank by savings. Stop after 6 searches maximum.`;

const FULL_PROMPT = `Search the following Kuwaiti supermarkets for current offers and promotions on coffee supplies, dairy alternatives, syrups, and F&B consumables:

${SUPERMARKETS.map(s => `- ${s.name} (${s.url})`).join("\n")}

Focus on:
- Coffee beans / blends (Arabica, specialty roasts)
- Milk alternatives (oat milk, almond milk)
- Syrups and flavourings (vanilla, caramel, hazelnut)
- Takeaway cups, lids, straws
- Cleaning and sanitiser products

For each offer found, report:
1. Supermarket name
2. Product name and size/quantity
3. Regular price vs offer price (in KWD)
4. Offer expiry date if shown
5. Whether bulk/wholesale quantities are available

Rank the best deals by savings percentage. Highlight any items that match our current CRITICAL or HIGH inventory shortfalls (Arabica Blend 1kg, Oat Milk 1L, Takeaway Cups 12oz, Vanilla Syrup 750ml).`;

const SCHEDULE_OPTIONS = [
  { label: "Off", hours: 0 },
  { label: "Every 6h", hours: 6 },
  { label: "Daily", hours: 24 },
];

export default function MarketResearch() {
  const [quickScan, setQuickScan] = useState(true);
  const [scheduleHours, setScheduleHours] = useState(0);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Market Research</h2>
      <p className="text-sm text-gray-500 mb-6">
        Scan Kuwaiti supermarkets for live offers on coffee supplies and F&B consumables.
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Scan mode toggle */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scan Mode</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              onClick={() => setQuickScan(true)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${quickScan ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              ⚡ Quick
            </button>
            <button
              onClick={() => setQuickScan(false)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${!quickScan ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              🔍 Full
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {quickScan ? "4 SKUs · 3 stores · ~90s" : "All SKUs · 6 stores · ~5–7 min"}
          </span>
        </div>

        {/* Schedule picker */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Auto-refresh</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {SCHEDULE_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setScheduleHours(opt.hours)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${scheduleHours === opt.hours ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {scheduleHours > 0 && (
            <span className="text-xs text-green-600 font-medium">● Auto-runs on page load when stale</span>
          )}
        </div>
      </div>

      {/* Supermarket coverage */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Supermarkets Monitored
          {quickScan && <span className="ml-2 text-xs font-normal text-amber-600">⚡ Quick scan covers top 3</span>}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {SUPERMARKETS.map((s, i) => (
            <div key={s.name} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${quickScan && i >= 3 ? "bg-gray-50 opacity-40" : "bg-gray-50"}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${quickScan && i >= 3 ? "bg-gray-300" : "bg-green-400"}`} />
              <div>
                <p className="text-xs font-medium text-gray-700">{s.name}</p>
                <p className="text-xs text-gray-400">{s.url}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category targets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Priority Categories</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Coffee Beans", critical: true },
            { label: "Oat Milk", critical: true },
            { label: "Vanilla Syrup", critical: true },
            { label: "Takeaway Cups", critical: true },
            { label: "Almond Milk", critical: false },
            { label: "Straws", critical: false },
            { label: "Sanitiser", critical: false },
            { label: "Cold Brew", critical: false },
          ].map(cat => (
            <span key={cat.label}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                cat.critical
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : quickScan
                    ? "bg-gray-100 text-gray-400"
                    : "bg-indigo-50 text-indigo-700"
              }`}>
              {cat.critical && "🔴 "}{cat.label}
            </span>
          ))}
        </div>
        {quickScan && <p className="text-xs text-gray-400 mt-2">⚡ Quick scan targets red items only</p>}
      </div>

      <AgentPanel
        agent="market-research"
        defaultPrompt={quickScan ? QUICK_PROMPT : FULL_PROMPT}
        promptKey={quickScan ? "quick" : "full"}
        cacheKey="market-research-report"
        scheduleHours={scheduleHours}
      />
    </div>
  );
}
