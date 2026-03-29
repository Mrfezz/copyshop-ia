import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type PurchaseRow = {
  id: string;
  product_key: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  stripe_session_id: string | null;
};

type EntitlementRow = {
  product_key: string | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function jsonNoStore(body: any, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");
  return res;
}

function getBearerToken(req: Request) {
  const auth = (req.headers.get("authorization") || "").trim();
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getSortTime(row: {
  created_at?: string | null;
  updated_at?: string | null;
}) {
  return new Date(row.updated_at || row.created_at || 0).getTime();
}

function isPaidLikeStatus(status?: string | null) {
  const value = (status || "").toLowerCase().trim();
  return ["paid", "complete", "completed", "succeeded", "active"].includes(value);
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return jsonNoStore({ error: "Unauthorized: token manquant" }, { status: 401 });
    }

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token);

    if (userErr || !userRes?.user) {
      return jsonNoStore({ error: "Unauthorized: session invalide" }, { status: 401 });
    }

    const user = userRes.user;
    const userId = user.id ?? null;
    const email = user.email ?? null;

    if (!userId && !email) {
      return jsonNoStore({ error: "Unauthorized: utilisateur introuvable" }, { status: 401 });
    }

    let purchasesData: PurchaseRow[] | null = null;
    let purchasesError: { message: string } | null = null;

    if (userId) {
      const result = await supabaseAdmin
        .from("purchases")
        .select(
          "id, product_key, amount_total, currency, status, created_at, updated_at, stripe_session_id"
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      purchasesData = result.data as PurchaseRow[] | null;
      purchasesError = result.error;
    }

    if ((!purchasesData || purchasesData.length === 0) && email) {
      const fallbackResult = await supabaseAdmin
        .from("purchases")
        .select(
          "id, product_key, amount_total, currency, status, created_at, updated_at, stripe_session_id"
        )
        .eq("email", email)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      purchasesData = fallbackResult.data as PurchaseRow[] | null;
      purchasesError = fallbackResult.error;
    }

    let entitlementData: EntitlementRow[] | null = null;
    let entitlementError: { message: string } | null = null;

    if (userId) {
      const result = await supabaseAdmin
        .from("entitlements")
        .select("product_key, active, created_at, updated_at")
        .eq("user_id", userId)
        .eq("active", true)
        .in("product_key", ["ia-basic", "ia-premium", "ia-ultime", "recharge-ia", "ia-recharge-5"])
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      entitlementData = result.data as EntitlementRow[] | null;
      entitlementError = result.error;
    }

    if ((!entitlementData || entitlementData.length === 0) && email) {
      const fallbackResult = await supabaseAdmin
        .from("entitlements")
        .select("product_key, active, created_at, updated_at")
        .eq("email", email)
        .eq("active", true)
        .in("product_key", ["ia-basic", "ia-premium", "ia-ultime", "recharge-ia", "ia-recharge-5"])
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      entitlementData = fallbackResult.data as EntitlementRow[] | null;
      entitlementError = fallbackResult.error;
    }

    if (purchasesError) {
      console.error("purchases error:", purchasesError.message);
      return jsonNoStore({ error: purchasesError.message }, { status: 500 });
    }

    if (entitlementError) {
      console.error("entitlements fallback error:", entitlementError.message);
    }

    const purchases: PurchaseRow[] = Array.isArray(purchasesData) ? purchasesData : [];
    const activeEntitlement: EntitlementRow | null =
      Array.isArray(entitlementData) && entitlementData.length > 0 ? entitlementData[0] : null;

    let finalPurchases = [...purchases];

    if (activeEntitlement?.product_key) {
      const alreadyPresent = finalPurchases.some(
        (p) => p.product_key === activeEntitlement.product_key && isPaidLikeStatus(p.status)
      );

      if (!alreadyPresent) {
        finalPurchases.unshift({
          id: `entitlement-${activeEntitlement.product_key}-${activeEntitlement.updated_at || activeEntitlement.created_at || Date.now()}`,
          product_key: activeEntitlement.product_key,
          amount_total: null,
          currency: "EUR",
          status: "active",
          created_at: activeEntitlement.created_at ?? activeEntitlement.updated_at,
          updated_at: activeEntitlement.updated_at ?? activeEntitlement.created_at,
          stripe_session_id: null,
        });
      }
    }

    finalPurchases.sort((a, b) => getSortTime(b) - getSortTime(a));

    return jsonNoStore({ purchases: finalPurchases }, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/me/purchases error:", e);
    return jsonNoStore(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}