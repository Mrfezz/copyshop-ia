import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EntitlementRow = {
  product_key: string | null;
  active: boolean | null;
  credits_total: number | null;
  credits_used: number | null;
  unlimited: boolean | null;
};

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function rankPack(productKey: string | null | undefined) {
  if (productKey === "ia-ultime") return 3;
  if (productKey === "ia-premium") return 2;
  if (productKey === "ia-basic") return 1;
  return 0;
}

function getPackContent(productKey: string | null | undefined) {
  if (productKey === "ia-ultime") {
    return {
      title: "Pack Ultime IA activé",
      subtitle: "Tu peux générer des boutiques avec l’offre la plus complète.",
    };
  }

  if (productKey === "ia-premium") {
    return {
      title: "Pack Premium IA activé",
      subtitle: "Tu peux générer des boutiques avec un niveau avancé.",
    };
  }

  if (productKey === "ia-basic") {
    return {
      title: "Pack Basic IA activé",
      subtitle: "Tu peux générer tes boutiques avec ton pack actuel.",
    };
  }

  return {
    title: "Génère tes boutiques Shopify grâce à l’IA",
    subtitle: "Colle un lien produit et lance la génération.",
  };
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = userData.user.email;

    const { data, error } = await supabaseAdmin
      .from("entitlements")
      .select("product_key, active, credits_total, credits_used, unlimited")
      .eq("email", email)
      .eq("active", true)
      .in("product_key", ["ia-basic", "ia-premium", "ia-ultime"]);

    if (error) {
      console.error("entitlements/me DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const best: EntitlementRow | null =
      (data ?? [])
        .filter((row) => rankPack(row.product_key) > 0)
        .sort((a, b) => rankPack(b.product_key) - rankPack(a.product_key))[0] ?? null;

    if (!best) {
      const fallback = getPackContent(null);

      return NextResponse.json(
        {
          email,
          packKey: null,
          quota: null,
          unlimited: false,
          creditsUsed: 0,
          creditsRemaining: 0,
          title: fallback.title,
          subtitle: fallback.subtitle,
        },
        { status: 200 }
      );
    }

    const unlimited = Boolean(best.unlimited);
    const quota = unlimited ? null : Number(best.credits_total ?? 0);
    const creditsUsed = Number(best.credits_used ?? 0);
    const creditsRemaining = unlimited
      ? null
      : Math.max(0, Number(best.credits_total ?? 0) - Number(best.credits_used ?? 0));

    const packContent = getPackContent(best.product_key);

    return NextResponse.json(
      {
        email,
        packKey: best.product_key,
        quota,
        unlimited,
        creditsUsed,
        creditsRemaining,
        title: packContent.title,
        subtitle: packContent.subtitle,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("entitlements/me server error:", e?.message ?? e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}