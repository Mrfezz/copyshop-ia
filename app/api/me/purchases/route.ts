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

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

function getSortTime(row: {
  created_at?: string | null;
  updated_at?: string | null;
}) {
  return new Date(row.updated_at || row.created_at || 0).getTime();
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token);
    const email = userRes?.user?.email ?? null;

    if (userErr || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: purchasesData, error: purchasesError }, { data: entitlementData, error: entitlementError }] =
      await Promise.all([
        supabaseAdmin
          .from("purchases")
          .select("id, product_key, amount_total, currency, status, created_at, updated_at, stripe_session_id")
          .eq("email", email)
          .order("updated_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false, nullsFirst: false }),

        supabaseAdmin
          .from("entitlements")
          .select("product_key, active, created_at, updated_at")
          .eq("email", email)
          .eq("active", true)
          .in("product_key", ["ia-basic", "ia-premium", "ia-ultime", "recharge-ia", "ia-recharge-5"])
          .order("updated_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false, nullsFirst: false })
          .limit(1),
      ]);

    if (purchasesError) {
      return NextResponse.json({ error: purchasesError.message }, { status: 500 });
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
        (p) =>
          p.product_key === activeEntitlement.product_key &&
          ["paid", "complete", "completed", "succeeded", "active"].includes(
            (p.status || "").toLowerCase()
          )
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

    return NextResponse.json({ purchases: finalPurchases });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}