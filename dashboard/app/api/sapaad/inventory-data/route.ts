import { NextResponse } from "next/server";
import { isSapaadConfigured, getStockLevels, SapaadStockItem } from "@/lib/sapaad";

export type UrgencyTier = "CRITICAL" | "HIGH" | "MEDIUM" | "OK";

export interface StockLine {
  sku: string;
  onHand: number;
  par: number;
  unit: string;
  category: string;
  fillPct: number;       // onHand / par as percentage
  daysLeft: number | null; // null = unknown consumption rate
  tier: UrgencyTier;
}

export interface InventoryDataResponse {
  live: boolean;
  asOf: string;
  items: StockLine[];
}

function getTier(fillPct: number): UrgencyTier {
  if (fillPct <= 0.15) return "CRITICAL";  // ≤15% of par
  if (fillPct <= 0.35) return "HIGH";       // ≤35%
  if (fillPct <= 0.60) return "MEDIUM";     // ≤60%
  return "OK";
}

function buildFromSapaad(items: SapaadStockItem[]): InventoryDataResponse {
  const lines: StockLine[] = items.map(item => {
    const par = item.par_level || 1; // avoid div/0
    const fillPct = item.on_hand / par;
    return {
      sku: item.item_name,
      onHand: item.on_hand,
      par,
      unit: item.unit,
      category: item.category,
      fillPct: Math.round(fillPct * 100) / 100,
      daysLeft: null, // Sapaad doesn't expose consumption rate directly
      tier: getTier(fillPct),
    };
  });

  // Sort: CRITICAL first, then HIGH, MEDIUM, OK
  const order: UrgencyTier[] = ["CRITICAL", "HIGH", "MEDIUM", "OK"];
  lines.sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));

  return { live: true, asOf: new Date().toISOString(), items: lines };
}

/** Demo data used when SAPAAD_API_KEY is not set */
function demoData(): InventoryDataResponse {
  return {
    live: false,
    asOf: new Date().toISOString(),
    items: [
      { sku: "Arabica Blend 1kg",    onHand: 8,   par: 40,   unit: "kg",  category: "Coffee",     fillPct: 0.20, daysLeft: 1.2,  tier: "CRITICAL" },
      { sku: "Oat Milk 1L",          onHand: 24,  par: 80,   unit: "L",   category: "Dairy Alt",  fillPct: 0.30, daysLeft: 1.8,  tier: "CRITICAL" },
      { sku: "Takeaway Cups 12oz",   onHand: 320, par: 1000, unit: "pcs", category: "Packaging",  fillPct: 0.32, daysLeft: 1.9,  tier: "CRITICAL" },
      { sku: "Vanilla Syrup 750ml",  onHand: 6,   par: 20,   unit: "btl", category: "Syrups",     fillPct: 0.30, daysLeft: 3.5,  tier: "HIGH" },
      { sku: "Cold Brew Concentrate",onHand: 10,  par: 30,   unit: "L",   category: "Coffee",     fillPct: 0.33, daysLeft: 4.0,  tier: "HIGH" },
      { sku: "Decaf Blend 1kg",      onHand: 15,  par: 30,   unit: "kg",  category: "Coffee",     fillPct: 0.50, daysLeft: 6.0,  tier: "MEDIUM" },
      { sku: "Almond Milk 1L",       onHand: 30,  par: 60,   unit: "L",   category: "Dairy Alt",  fillPct: 0.50, daysLeft: 7.5,  tier: "MEDIUM" },
      { sku: "Cardamom Ground",      onHand: 4,   par: 8,    unit: "kg",  category: "Spices",     fillPct: 0.50, daysLeft: 8.0,  tier: "MEDIUM" },
      { sku: "Paper Straws",         onHand: 800, par: 1500, unit: "pcs", category: "Packaging",  fillPct: 0.53, daysLeft: 10.0, tier: "MEDIUM" },
      { sku: "Sanitiser 5L",         onHand: 12,  par: 20,   unit: "btl", category: "Cleaning",   fillPct: 0.60, daysLeft: 14.0, tier: "OK" },
    ],
  };
}

export async function GET() {
  if (!isSapaadConfigured()) {
    return NextResponse.json(demoData());
  }

  try {
    const items = await getStockLevels();
    return NextResponse.json(buildFromSapaad(items));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sapaad API error";
    console.error("[sapaad/inventory-data]", message);
    return NextResponse.json(
      { error: message, fallback: demoData() },
      { status: 502 }
    );
  }
}
