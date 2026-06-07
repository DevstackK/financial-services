/**
 * Sapaad POS API client
 *
 * Docs: https://developers.sapaad.com
 * Auth: Bearer token via SAPAAD_API_KEY env var
 * Base: https://api.sapaad.com/api/v1
 *
 * NOTE: Verify exact endpoint paths against your Sapaad account plan.
 * Enterprise accounts may have a different base URL provided by Sapaad support.
 */

const BASE_URL = process.env.SAPAAD_BASE_URL ?? "https://api.sapaad.com/api/v1";
const API_KEY  = process.env.SAPAAD_API_KEY;

export function isSapaadConfigured(): boolean {
  return !!API_KEY;
}

async function sapaadFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!API_KEY) throw new Error("SAPAAD_API_KEY is not configured");

  const url = new URL(`${BASE_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    // 30-second timeout — Sapaad reports can be slow for large date ranges
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sapaad API ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SapaadBranch {
  id: string;
  name: string;
  code: string;
}

export interface SapaadSalesSummary {
  branch_id: string;
  branch_name: string;
  date: string;
  gross_sales: number;
  net_sales: number;
  cash_sales: number;
  card_sales: number;
  voids: number;
  refunds: number;
  discounts: number;
  orders_count: number;
}

export interface SapaadStockItem {
  item_id: string;
  item_name: string;
  sku: string;
  unit: string;
  on_hand: number;
  par_level: number;
  reorder_level: number;
  category: string;
  branch_id?: string;
  branch_name?: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** List all branches / locations */
export async function getBranches(): Promise<SapaadBranch[]> {
  const data = await sapaadFetch<{ data: SapaadBranch[] }>("/branches");
  return data.data;
}

/**
 * Sales summary per branch for a given date (YYYY-MM-DD).
 * Defaults to today.
 */
export async function getSalesSummary(date?: string): Promise<SapaadSalesSummary[]> {
  const targetDate = date ?? new Date().toISOString().split("T")[0];
  const data = await sapaadFetch<{ data: SapaadSalesSummary[] }>("/reports/sales-summary", {
    date: targetDate,
    group_by: "branch",
  });
  return data.data;
}

/**
 * Current stock levels across all branches.
 * Pass branch_id to scope to a single location.
 */
export async function getStockLevels(branchId?: string): Promise<SapaadStockItem[]> {
  const params: Record<string, string> = {};
  if (branchId) params.branch_id = branchId;
  const data = await sapaadFetch<{ data: SapaadStockItem[] }>("/inventory/stock-levels", params);
  return data.data;
}
