// app/api/outil-ia/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RequestBody = {
  productUrl?: string;
  imageBase64?: string | null; // accepté, pas utilisé pour l’instant
  productKey?: string; // optionnel : si tu veux vérifier un pack précis
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function hasActiveEntitlement(email: string, productKey?: string) {
  let q = supabaseAdmin
    .from("entitlements")
    .select("id, product_key, active")
    .eq("email", email)
    .eq("active", true);

  // si tu veux obliger un pack précis
  if (productKey) q = q.eq("product_key", productKey);

  // sinon on accepte n’importe quel pack actif
  const { data, error } = await q.limit(1);

  if (error) {
    console.error("❌ Erreur check entitlements:", error);
    // On renvoie false, mais on log
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function POST(req: Request) {
  try {
    // 1) Vérifier OPENAI_API_KEY
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY manquante dans les variables d’environnement", 500);
    }

    // 2) Vérifier que l’utilisateur est connecté (token Supabase)
    const token = getBearerToken(req);
    if (!token) {
      return jsonError("Non autorisé : token manquant (Authorization: Bearer ...)", 401);
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData?.user) {
      console.error("❌ supabaseAdmin.auth.getUser error:", userErr);
      return jsonError("Non autorisé : session invalide", 401);
    }

    const email = userData.user.email;
    if (!email) {
      return jsonError("Non autorisé : email utilisateur introuvable", 401);
    }

    // 3) Lire le body
    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return jsonError("Body JSON invalide", 400);
    }

    const productUrl = (body.productUrl || "").trim();
    const requestedProductKey = (body.productKey || "").trim() || undefined;

    if (!productUrl) {
      return jsonError("productUrl est requis", 400);
    }

    // 4) Vérifier entitlement (pack actif)
    const allowed = await hasActiveEntitlement(email, requestedProductKey);

    if (!allowed) {
      return jsonError(
        requestedProductKey
          ? `Accès refusé : pack "${requestedProductKey}" non actif pour ${email}`
          : `Accès refusé : aucun pack actif pour ${email}`,
        403
      );
    }

    // 5) Construire prompt
    const prompt = `
Tu es un expert en copywriting e-commerce.
Génère une proposition de boutique Shopify pour ce produit.

Données fournies :
- Lien produit : ${productUrl}

Je veux que tu renvoies UNIQUEMENT un objet JSON avec la structure suivante :

{
  "storeName": "Nom de la boutique",
  "tagline": "Slogan court orienté bénéfice",
  "homepageSections": [
    "Titre d'une section d'accueil",
    "Autre section d'accueil",
    "..."
  ],
  "productPageBlocks": [
    "Bloc important pour la page produit",
    "Autre bloc important",
    "..."
  ],
  "brandTone": "Description du ton de la marque (2-3 phrases)"
}

Pas de texte autour, pas de markdown, pas d'explication. Juste du JSON valide.
`.trim();

    // 6) Appel OpenAI
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
          {
            role: "system",
            content: "Tu es un assistant spécialisé en e-commerce et en boutiques Shopify.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("❌ Erreur OpenAI:", errorText);
      return jsonError("Erreur lors de l'appel à l'API OpenAI", 502);
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return jsonError("Réponse vide de l'API OpenAI", 500);
    }

    // 7) Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("❌ JSON OpenAI invalide:", content);
      return jsonError("OpenAI a renvoyé un JSON invalide", 502);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Erreur dans /api/outil-ia:", error);
    return jsonError("Erreur interne du serveur", 500);
  }
}
