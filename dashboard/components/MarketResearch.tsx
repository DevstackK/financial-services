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

const CATEGORIES = [
  { label: "Coffee Beans", detail: "Arabica blend / specialty roasts 1kg" },
  { label: "Oat Milk", detail: "Oat milk 1L cartons" },
  { label: "Vanilla Syrup", detail: "Vanilla syrup 750ml" },
  { label: "Takeaway Cups", detail: "Takeaway cups 12oz with lids" },
  { label: "Almond Milk", detail: "Almond milk 1L cartons" },
  { label: "Caramel Syrup", detail: "Caramel syrup 750ml" },
  { label: "Hazelnut Syrup", detail: "Hazelnut syrup 750ml" },
  { label: "Cold Brew Concentrate", detail: "Cold brew concentrate 1L" },
  { label: "Paper Straws", detail: "Paper straws (bulk packs)" },
  { label: "Sanitiser", detail: "Hand sanitiser / surface sanitiser" },
  { label: "Cardamom", detail: "Ground cardamom 100g+" },
  { label: "Decaf Blend", detail: "Decaf coffee blend 1kg" },
];

const SCHEDULE_OPTIONS = [
  { label: "Off", hours: 0 },
  { label: "Every 6h", hours: 6 },
  { label: "Daily", hours: 24 },
];

function buildQuickPrompt(stores: typeof SUPERMARKETS, cats: typeof CATEGORIES): string {
  const maxSearches = Math.min(stores.length * cats.length + 2, 8);
  return `[QUICK SCAN] Search the following Kuwaiti supermarkets for current prices and promotions on the selected products only. Run a maximum of ${maxSearches} searches and stop once you have usable data — do not seek perfect coverage.

Supermarkets to check:
${stores.map(s => `- ${s.name} (${s.url})`).join("\n")}

Products to find:
${cats.map((c, i) => `${i + 1}. ${c.label} — ${c.detail}`).join("\n")}

For each item found, report: supermarket, product name and size, price in KWD, and any active promotion or discount. Rank results by best savings percentage.`;
}

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-indigo-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function MarketResearch() {
  const [quickScan, setQuickScan] = useState(true);
  const [scheduleHours, setScheduleHours] = useState(0);

  // Quick scan selections — stores + categories, all on by default
  const [selectedStores, setSelectedStores] = useState<Set<string>>(
    new Set(SUPERMARKETS.slice(0, 3).map(s => s.name))
  );
  const [selectedCats, setSelectedCats] = useState<Set<string>>(
    new Set(CATEGORIES.slice(0, 4).map(c => c.label))
  );

  function toggleStore(name: string) {
    setSelectedStores(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleCat(label: string) {
    setSelectedCats(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  const activeStores = SUPERMARKETS.filter(s => selectedStores.has(s.name));
  const activeCats = CATEGORIES.filter(c => selectedCats.has(c.label));

  const quickPrompt = buildQuickPrompt(activeStores, activeCats);
  const activePrompt = quickScan ? quickPrompt : FULL_PROMPT;
  const promptKey = quickScan
    ? `quick-${[...selectedStores].sort().join()}-${[...selectedCats].sort().join()}`
    : "full";

  const canRun = !quickScan || (activeStores.length > 0 && activeCats.length > 0);


  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Market Research</h2>
      <p className="text-sm text-gray-500 mb-6">
        Scan Kuwaiti supermarkets for live offers on coffee supplies and F&amp;B consumables.
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
            {quickScan
              ? `${activeCats.length} item${activeCats.length !== 1 ? "s" : ""} · ${activeStores.length} store${activeStores.length !== 1 ? "s" : ""} · ~${Math.max(30, activeStores.length * activeCats.length * 15)}s`
              : "All SKUs · 6 stores · ~5–7 min"}
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

      {/* Quick scan selectors */}
      {quickScan && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Store selector */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Supermarkets</h3>
              <div className="flex gap-2">
                <button onClick={() => setSelectedStores(new Set(SUPERMARKETS.map(s => s.name)))}
                  className="text-xs text-indigo-600 hover:underline">All</button>
                <span className="text-gray-300">·</span>
                <button onClick={() => setSelectedStores(new Set())}
                  className="text-xs text-gray-400 hover:underline">None</button>
              </div>
            </div>
            <div className="space-y-2">
              {SUPERMARKETS.map(s => (
                <label key={s.name} className="flex items-center gap-3 cursor-pointer group">
                  <Toggle checked={selectedStores.has(s.name)} onChange={() => toggleStore(s.name)} />
                  <div>
                    <p className={`text-xs font-medium transition-colors ${selectedStores.has(s.name) ? "text-gray-800" : "text-gray-400"}`}>
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">{s.url}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Products to Search</h3>
              <div className="flex gap-2">
                <button onClick={() => setSelectedCats(new Set(CATEGORIES.map(c => c.label)))}
                  className="text-xs text-indigo-600 hover:underline">All</button>
                <span className="text-gray-300">·</span>
                <button onClick={() => setSelectedCats(new Set())}
                  className="text-xs text-gray-400 hover:underline">None</button>
              </div>
            </div>
            <div className="space-y-2">
              {CATEGORIES.map(c => (
                <label key={c.label} className="flex items-center gap-3 cursor-pointer">
                  <Toggle checked={selectedCats.has(c.label)} onChange={() => toggleCat(c.label)} />
                  <div>
                    <p className={`text-xs font-medium transition-colors ${selectedCats.has(c.label) ? "text-gray-800" : "text-gray-400"}`}>
                      {c.label}
                    </p>
                    <p className="text-xs text-gray-400">{c.detail}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full scan: static supermarket grid */}
      {!quickScan && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Supermarkets Monitored</h3>
          <div className="grid grid-cols-3 gap-3">
            {SUPERMARKETS.map(s => (
              <div key={s.name} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!canRun && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          Select at least one supermarket and one product to run a Quick Scan.
        </div>
      )}

      <AgentPanel
        agent="market-research"
        defaultPrompt={activePrompt}
        promptKey={promptKey}
        cacheKey="market-research-report"
        scheduleHours={scheduleHours}
        disabled={!canRun}
      />
    </div>
  );
}
