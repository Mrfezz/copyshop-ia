// app/api/outil-ia/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RequestBody = {
  productUrl?: string;
  imageBase64?: string | null;
  productKey?: string; // optionnel (envoyé côté client), non obligatoire ici
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function rankPack(productKey: string) {
  if (productKey === "ia-ultime") return 3;
  if (productKey === "ia-premium") return 2;
  if (productKey === "ia-basic") return 1;
  return 0;
}

function safeTrim(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function isLikelyUrl(v: string) {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY manquante", 500);
    }

    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé (Bearer token manquant)", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    const email = userData?.user?.email ?? null;
    if (userErr || !email) return jsonError("Session invalide", 401);

    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return jsonError("Body JSON invalide", 400);
    }

    const productUrl = safeTrim(body.productUrl);
    if (!productUrl) return jsonError("productUrl est requis", 400);
    if (!isLikelyUrl(productUrl)) return jsonError("productUrl invalide", 400);

    // 1) récupérer meilleur pack actif
    const { data: ents, error: entErr } = await supabaseAdmin
      .from("entitlements")
      .select("product_key, credits_total, credits_used, unlimited")
      .eq("email", email)
      .eq("active", true);

    if (entErr) {
      console.error("DB entitlements error:", entErr);
      return jsonError("Erreur DB entitlements", 500);
    }

    const best =
      (ents ?? [])
        .filter((e: any) => typeof e?.product_key === "string" && rankPack(e.product_key) > 0)
        .sort((a: any, b: any) => rankPack(b.product_key) - rankPack(a.product_key))[0] ?? null;

    if (!best) return jsonError("Accès refusé : aucun pack actif", 403);

    const creditsRemaining = best.unlimited
      ? null
      : Math.max(0, (best.credits_total ?? 0) - (best.credits_used ?? 0));

    if (!best.unlimited && (creditsRemaining ?? 0) <= 0) {
      return jsonError("Crédits épuisés. Recharge nécessaire.", 403);
    }

    // 2) prompt différent selon pack
    const packHint =
      best.product_key === "ia-basic"
        ? "Pack BASIC: réponse simple et efficace."
        : best.product_key === "ia-premium"
        ? "Pack PREMIUM: ajoute angles marketing + objections + USP."
        : "Pack ULTIME: ultra détaillé + variations + structure complète.";

    const prompt = `
${packHint}

Tu es un expert en copywriting e-commerce.
Génère une proposition de boutique Shopify pour ce produit.

Données fournies :
- Lien produit : ${productUrl}

Renvoie UNIQUEMENT du JSON valide:
{
  "storeName": "Nom de la boutique",
  "tagline": "Slogan court orienté bénéfice",
  "homepageSections": ["...", "..."],
  "productPageBlocks": ["...", "..."],
  "brandTone": "2-3 phrases"
}
`.trim();

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Assistant e-commerce / Shopify." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI error:", errorText);
      return jsonError("Erreur OpenAI", 502);
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") return jsonError("Réponse OpenAI vide", 500);

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return jsonError("OpenAI a renvoyé un JSON invalide", 502);
    }

    // petite validation minimale (évite retours bizarres)
    if (
      !parsed ||
      typeof parsed.storeName !== "string" ||
      typeof parsed.tagline !== "string" ||
      !Array.isArray(parsed.homepageSections) ||
      !Array.isArray(parsed.productPageBlocks) ||
      typeof parsed.brandTone !== "string"
    ) {
      return jsonError("OpenAI a renvoyé un format inattendu", 502);
    }

    // 3) consommer 1 crédit (si pas illimité)
    if (!best.unlimited) {
      const nextUsed = (best.credits_used ?? 0) + 1;

      const { error: updErr } = await supabaseAdmin
        .from("entitlements")
        .update({
          credits_used: nextUsed,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)
        .eq("product_key", best.product_key);

      if (updErr) {
        // On n'empêche pas la réponse, mais on log l'erreur
        console.error("❌ credits update error:", updErr);
      }
    }

    return NextResponse.json({
      ...parsed,
      meta: {
        pack: best.product_key,
        creditsRemaining: best.unlimited ? null : Math.max(0, (creditsRemaining ?? 0) - 1),
      },
    });
  } catch (e) {
    console.error(e);
    return jsonError("Erreur serveur", 500);
  }
}
