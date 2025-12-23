// app/api/outil-ia/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RequestBody = {
  productUrl?: string;
  imageBase64?: string | null; // (optionnel, pas utilisé dans le prompt pour éviter un payload énorme)
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

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY manquante", 500);
    }

    // 1) Auth via Bearer token (access_token Supabase)
    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé (Bearer token manquant)", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user?.email) return jsonError("Session invalide", 401);

    const email = userData.user.email;

    // 2) Body
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return jsonError("Body JSON invalide", 400);
    }

    const productUrl = (body.productUrl || "").trim();
    if (!productUrl) return jsonError("productUrl est requis", 400);
    if (!isValidHttpUrl(productUrl)) return jsonError("productUrl invalide (http/https uniquement)", 400);

    // Sécurité : si image base64 énorme, on refuse
    if (body.imageBase64 && body.imageBase64.length > 3_000_000) {
      return jsonError("Image trop lourde. Réduis la taille avant envoi.", 413);
    }

    // 3) Récupérer le meilleur pack actif
    const { data: ents, error: entErr } = await supabaseAdmin
      .from("entitlements")
      .select("product_key, credits_total, credits_used, unlimited, active")
      .eq("email", email)
      .eq("active", true);

    if (entErr) return jsonError("Erreur DB entitlements", 500);

    const best =
      (ents ?? [])
        .filter((e: any) => !!e?.product_key)
        .sort((a: any, b: any) => rankPack(b.product_key) - rankPack(a.product_key))[0] ?? null;

    if (!best) return jsonError("Accès refusé : aucun pack actif", 403);

    const total = Number(best.credits_total ?? 0);
    const used = Number(best.credits_used ?? 0);
    const unlimited = Boolean(best.unlimited);

    const creditsRemaining = unlimited ? null : Math.max(0, total - used);

    if (!unlimited && (creditsRemaining ?? 0) <= 0) {
      return jsonError("Crédits épuisés. Recharge nécessaire.", 403);
    }

    // 4) Prompt selon pack
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

    // 5) Appel OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.7,
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

    const aiData = await openaiRes.json();
    const content = aiData?.choices?.[0]?.message?.content;
    if (!content) return jsonError("Réponse OpenAI vide", 500);

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return jsonError("OpenAI a renvoyé un JSON invalide", 502);
    }

    // 6) Consommer 1 crédit (si pas illimité) — avec garde anti-race légère
    let newCreditsRemaining = unlimited ? null : creditsRemaining;

    if (!unlimited) {
      const nextUsed = used + 1;

      // On tente l’update. (NB: pas parfaitement atomique sans RPC, mais mieux que rien)
      const { data: updatedRows, error: updErr } = await supabaseAdmin
        .from("entitlements")
        .update({
          credits_used: nextUsed,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)
        .eq("product_key", best.product_key)
        .eq("active", true)
        .select("credits_total, credits_used, unlimited");

      if (updErr) {
        console.error("Credits update error:", updErr.message);
        return jsonError("Erreur lors de la consommation des crédits", 500);
      }

      if (!updatedRows || updatedRows.length === 0) {
        // Cas rare : ligne introuvable ou pack désactivé entre temps
        return jsonError("Impossible de consommer les crédits (pack indisponible).", 409);
      }

      newCreditsRemaining = Math.max(0, total - nextUsed);
    }

    return NextResponse.json({
      ...parsed,
      meta: {
        pack: best.product_key,
        creditsRemaining: unlimited ? null : newCreditsRemaining,
      },
    });
  } catch (e: any) {
    console.error("[api/outil-ia] server error:", e?.message ?? e);
    return jsonError("Erreur serveur", 500);
  }
}
