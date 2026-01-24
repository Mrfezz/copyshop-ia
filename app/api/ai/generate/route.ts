import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function getEmailFromAuth(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;
  return data?.user?.email ?? null;
}

/** Schéma du "plan de boutique" retourné par l'IA */
const StoreBlueprint = z.object({
  brand: z.object({
    name: z.string().min(2),
    tagline: z.string().min(2),
    tone: z.enum(["premium", "fun", "minimal", "trust", "street"]),
    colors: z.array(z.string()).min(3).max(6), // hex ou noms
  }),
  product: z.object({
    title: z.string().min(2),
    oneLiner: z.string().min(2),
    description: z.string().min(30),
    bullets: z.array(z.string()).min(3).max(8),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(10),
  }),
  homepage: z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    sections: z.array(
      z.object({
        type: z.enum(["benefits", "socialProof", "howItWorks", "faq", "offer", "guarantee"]),
        title: z.string().optional(),
        content: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      })
    ).min(3).max(10),
  }),
  seo: z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    keywords: z.array(z.string()).min(3).max(12),
  }),
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY manquante", 500);
    }

    const email = await getEmailFromAuth(req);
    if (!email) return jsonError("Unauthorized", 401);

    const body = (await req.json()) as {
      productUrl?: string;
      productName?: string;
      audience?: string;
      language?: string;
    };

    const productUrl = (body.productUrl || "").trim();
    const productName = (body.productName || "").trim();
    const audience = (body.audience || "").trim();
    const language = (body.language || "fr").trim().toLowerCase();

    if (!productUrl && !productName) {
      return jsonError("Donne au moins un lien produit OU un nom de produit.");
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const prompt = `
Tu es un expert e-commerce Shopify. Génère un plan de boutique COMPLET et cohérent.
Langue: ${language}.
Contrainte: contenu actionnable, orienté conversion, sans blabla inutile.

Infos:
- Produit (lien): ${productUrl || "—"}
- Produit (nom): ${productName || "—"}
- Audience: ${audience || "grand public"}

Retourne uniquement le JSON conforme au schéma.
    `.trim();

    const ai = await openai.responses.parse({
      model,
      input: [
        { role: "system", content: "Tu génères un plan de boutique Shopify structuré." },
        { role: "user", content: prompt },
      ],
      text: { format: zodTextFormat(StoreBlueprint, "store_blueprint") },
    });

    const blueprint = ai.output_parsed;

    // ✅ option: on stocke pour historique (recommandé)
    const { data: saved, error: dbErr } = await supabaseAdmin
      .from("ai_generations")
      .insert({
        user_email: email,
        product_url: productUrl || null,
        product_name: productName || null,
        audience: audience || null,
        blueprint,
      })
      .select("id, created_at")
      .single();

    if (dbErr) {
      // on n'empêche pas le retour IA, mais on log l'erreur
      console.error("Supabase insert ai_generations error:", dbErr.message);
    }

    return NextResponse.json({
      ok: true,
      generation_id: saved?.id ?? null,
      blueprint,
    });
  } catch (e: any) {
    console.error("AI generate error:", e?.message ?? e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}
