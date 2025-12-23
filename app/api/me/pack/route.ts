// app/api/me/pack/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PackKey = "ia-basic" | "ia-premium" | "ia-ultime";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

const PACK_PRIORITY: Record<PackKey, number> = {
  "ia-basic": 1,
  "ia-premium": 2,
  "ia-ultime": 3,
};

function defaultQuota(pack: PackKey) {
  if (pack === "ia-basic") return 5;
  if (pack === "ia-premium") return 15;
  return null; // ultime illimité
}

function uiFor(pack: PackKey, quota: number | null) {
  if (pack === "ia-basic") {
    return {
      title: `Génère tes ${quota ?? 5} boutiques Shopify grâce à l’IA`,
      subtitle: `${quota ?? 5} boutiques t’attendent, prêtes à être générées.`,
    };
  }
  if (pack === "ia-premium") {
    return {
      title: `Génère tes ${quota ?? 15} boutiques Shopify grâce à l’IA`,
      subtitle: `${quota ?? 15} boutiques t’attendent, prêtes à être générées.`,
    };
  }
  return {
    title: "Génère tes boutiques Shopify en illimité grâce à l’IA",
    subtitle: "Génération illimitée : envoie un produit et on lance.",
  };
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé : token manquant", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return jsonError("Non autorisé : session invalide", 401);

    const email = userData.user.email;
    if (!email) return jsonError("Non autorisé : email introuvable", 401);

    const { data, error } = await supabaseAdmin
      .from("entitlements")
      .select("product_key, active, credits_total, credits_used, unlimited")
      .eq("email", email)
      .eq("active", true);

    if (error) {
      console.error("❌ Erreur lecture entitlements:", error);
      return jsonError("Erreur lecture entitlements", 500);
    }

    const packs = (data ?? [])
      .map((r: any) => r.product_key as PackKey)
      .filter((k) => k === "ia-basic" || k === "ia-premium" || k === "ia-ultime");

    if (packs.length === 0) {
      return NextResponse.json({
        email,
        packKey: null,
        quota: null,
        unlimited: false,
        creditsRemaining: 0,
        title: "Génère une boutique Shopify (pack requis).",
        subtitle: "Choisis un pack IA pour débloquer l’outil.",
      });
    }

    const best = packs.sort((a, b) => PACK_PRIORITY[b] - PACK_PRIORITY[a])[0];

    const bestRow = (data ?? []).find((r: any) => r.product_key === best) as any;

    const unlimited = Boolean(bestRow?.unlimited);
    const creditsTotal =
      unlimited ? null : (bestRow?.credits_total ?? defaultQuota(best) ?? 0);
    const creditsUsed = Number(bestRow?.credits_used ?? 0);

    const creditsRemaining = unlimited ? null : Math.max(0, creditsTotal - creditsUsed);

    const ui = uiFor(best, creditsTotal);

    return NextResponse.json({
      email,
      packKey: best,
      quota: creditsTotal,          // total crédits (après recharges)
      unlimited,
      creditsUsed,
      creditsRemaining,
      title: ui.title,
      subtitle: ui.subtitle,
    });
  } catch (e) {
    console.error("❌ /api/me/pack error:", e);
    return jsonError("Erreur interne", 500);
  }
}
