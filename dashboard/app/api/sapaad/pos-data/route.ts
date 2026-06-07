import { NextRequest, NextResponse } from "next/server";
import { isSapaadConfigured, getSalesSummary, SapaadSalesSummary } from "@/lib/sapaad";

export interface POSLocation {
  name: string;
  pos: number;      // net sales from POS system (KWD)
  cash: number;     // cash tendered (KWD)
  card: number;     // card sales (KWD)
  voids: number;
  refunds: number;
  orders: number;
  variance: number; // cash - pos (positive = over, negative = short)
  status: "OK" | "FLAG";
}

export interface POSDataResponse {
  live: boolean;
  date: string;
  currency: string;
  locations: POSLocation[];
}

/** Variance tolerance in KWD — flag anything beyond this */
const FLAG_THRESHOLD = 20;

function buildFromSapaad(summaries: SapaadSalesSummary[], date: string): POSDataResponse {
  const locations: POSLocation[] = summaries.map(s => {
    const variance = s.cash_sales - s.net_sales;
    return {
      name: s.branch_name,
      pos: Math.round(s.net_sales * 1000) / 1000,
      cash: Math.round(s.cash_sales * 1000) / 1000,
      card: Math.round(s.card_sales * 1000) / 1000,
      voids: Math.round(s.voids * 1000) / 1000,
      refunds: Math.round(s.refunds * 1000) / 1000,
      orders: s.orders_count,
      variance: Math.round(variance * 1000) / 1000,
      status: Math.abs(variance) > FLAG_THRESHOLD ? "FLAG" : "OK",
    };
  });

  return { live: true, date, currency: "KWD", locations };
}

/** Demo data used when SAPAAD_API_KEY is not set */
function demoData(date: string): POSDataResponse {
  return {
    live: false,
    date,
    currency: "KWD",
    locations: [
      { name: "Branch 1", pos: 18420, cash: 18390, card: 0, voids: 120, refunds: 30, orders: 142, variance: -30, status: "OK" },
      { name: "Branch 2", pos: 22150, cash: 21980, card: 0, voids: 200, refunds: 50, orders: 198, variance: -170, status: "FLAG" },
      { name: "Branch 3", pos: 15800, cash: 15820, card: 0, voids: 80,  refunds: 10, orders: 117, variance: 20,  status: "OK" },
      { name: "Branch 4", pos: 19600, cash: 19600, card: 0, voids: 150, refunds: 20, orders: 163, variance: 0,   status: "OK" },
      { name: "Branch 5", pos: 31200, cash: 31140, card: 0, voids: 300, refunds: 60, orders: 241, variance: -60, status: "FLAG" },
    ],
  };
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  if (!isSapaadConfigured()) {
    return NextResponse.json(demoData(date));
  }

  try {
    const summaries = await getSalesSummary(date);
    return NextResponse.json(buildFromSapaad(summaries, date));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sapaad API error";
    console.error("[sapaad/pos-data]", message);
    return NextResponse.json(
      { error: message, fallback: demoData(date) },
      { status: 502 }
    );
  }
}
