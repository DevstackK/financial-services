"use client";
import AgentPanel from "./AgentPanel";

const SUPERMARKETS = [
  { name: "Lulu Hypermarket", url: "luluhypermarket.com" },
  { name: "Carrefour Kuwait", url: "carrefourkuwait.com" },
  { name: "The Sultan Center", url: "tsc.com.kw" },
  { name: "Saveco", url: "saveco.com.kw" },
  { name: "Géant Kuwait", url: "geant-kuwait.com" },
  { name: "Al Rawdah Co-op", url: "alrawdah.coop" },
];

const DEFAULT_PROMPT = `Search the following Kuwaiti supermarkets for current offers and promotions on coffee supplies, dairy alternatives, syrups, and F&B consumables:

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

export default function MarketResearch() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Market Research</h2>
      <p className="text-sm text-gray-500 mb-6">
        Scan Kuwaiti supermarkets for live offers on coffee supplies and F&B consumables.
      </p>

      {/* Supermarket coverage */}
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

      {/* Category targets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Priority Categories</h3>
        <div className="flex flex-wrap gap-2">
          {["Coffee Beans", "Oat Milk", "Almond Milk", "Vanilla Syrup", "Takeaway Cups", "Straws", "Sanitiser", "Cold Brew"].map(cat => (
            <span key={cat} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {cat}
            </span>
          ))}
        </div>
      </div>

      <AgentPanel agent="market-research" defaultPrompt={DEFAULT_PROMPT} />
    </div>
  );
}
