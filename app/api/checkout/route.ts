// app/api/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS, type ProductKey } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const RECHARGE_KEY: ProductKey = "recharge-ia";
const IA_PACK_KEYS = ["ia-basic", "ia-premium", "ia-ultime"] as const;

function normalizeProductKey(raw: unknown): ProductKey {
  const s = String(raw || "").trim();

  // ✅ compat ancien nom
  const fixed = s === "ia-recharge-5" ? "recharge-ia" : s;

  return fixed as ProductKey;
}

function normalizeBaseUrl(raw?: string | null) {
  if (!raw) return null;
  let url = raw.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url.replace(/\/+$/, "");
}

function getBaseUrl(req: Request) {
  const fromEnv = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL
  );
  if (fromEnv) return fromEnv;

  const fromVercel = process.env.VERCEL_URL
    ? normalizeBaseUrl(`https://${process.env.VERCEL_URL}`)
    : null;
  if (fromVercel) return fromVercel;

  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (host) return normalizeBaseUrl(`${proto}://${host}`);

  return normalizeBaseUrl(req.headers.get("origin"));
}

function uniqValidKeys(keys: unknown[]): ProductKey[] {
  const out: ProductKey[] = [];
  const seen = new Set<string>();

  for (const k of keys) {
    const kk = normalizeProductKey(k);
    if (!kk || seen.has(kk)) continue;

    if (!(kk in PRODUCTS)) {
      throw new Error(`Produit invalide: ${String(k)}`);
    }

    seen.add(kk);
    out.push(kk);
  }
  return out;
}

// ✅ 401 = pas connecté (on veut forcer création/connexion compte avant paiement)
function jsonAuthRequired(message: string) {
  return NextResponse.json({ error: message, redirectTo: "/compte-client" }, { status: 401 });
}

// ✅ 403 = connecté mais action refusée (règle métier)
function jsonBlocked(message: string) {
  return NextResponse.json({ error: message, redirectTo: "/compte-client" }, { status: 403 });
}

async function getRequesterEmail(req: Request, body: any): Promise<string | null> {
  // 1) Bearer token (recommandé)
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;

  // 2) fallback si envoyé dans body (optionnel)
  const bodyToken =
    (typeof body?.access_token === "string" && body.access_token.trim()) ||
    (typeof body?.accessToken === "string" && body.accessToken.trim()) ||
    null;

  const token = bearer || bodyToken;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.email) return null;

  return data.user.email;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });

    // ✅ accepte 3 formats :
    const keysFromProductKey = body?.productKey ? [body.productKey] : [];
    const keysFromProductKeys = Array.isArray(body?.productKeys) ? body.productKeys : [];
    const keysFromItems = Array.isArray(body?.items)
      ? body.items.map((x: any) => x?.productKey).filter(Boolean)
      : [];

    const cleaned = uniqValidKeys([...keysFromProductKey, ...keysFromProductKeys, ...keysFromItems]);

    if (!cleaned.length) {
      return NextResponse.json({ error: "Aucun produit à payer" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(req);
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Impossible de déterminer l'URL du site. Renseigne NEXT_PUBLIC_SITE_URL." },
        { status: 500 }
      );
    }

    // ✅ email du demandeur (lié AU COMPTE connecté)
    // 🔥 IMPORTANT : si pas connecté => on bloque TOUT paiement
    const requesterEmail = await getRequesterEmail(req, body);
    if (!requesterEmail) {
      return jsonAuthRequired("Connexion requise : crée un compte / connecte-toi avant de payer.");
    }

    // ✅ Guard recharge (serveur)
    const includesRecharge = cleaned.includes(RECHARGE_KEY);
    if (includesRecharge) {
      // Interdit: recharge + ultime dans la même commande
      if (cleaned.includes("ia-ultime")) {
        return jsonBlocked("Recharge incompatible avec le Pack Ultime (illimité).");
      }

      const { data: ent, error: entErr } = await supabaseAdmin
        .from("entitlements")
        .select("product_key, active")
        .eq("email", requesterEmail)
        .eq("active", true)
        .in("product_key", [...IA_PACK_KEYS]);

      if (entErr) {
        console.error("❌ Entitlements lookup error:", entErr);
        return NextResponse.json({ error: "Erreur serveur (entitlements)." }, { status: 500 });
      }

      const keys = (ent ?? []).map((x: any) => String(x.product_key));
      const hasUltime = keys.includes("ia-ultime");
      const hasBasicOrPremium = keys.includes("ia-basic") || keys.includes("ia-premium");

      if (hasUltime) {
        return jsonBlocked("Tu as déjà le Pack Ultime (illimité) : recharge non disponible.");
      }
      if (!hasBasicOrPremium) {
        return jsonBlocked("Pour acheter une recharge, il faut déjà un Pack Basic ou Premium actif.");
      }
    }

    // ✅ Stripe line_items
    const line_items = cleaned.map((productKey) => {
      const product = PRODUCTS[productKey] as any;
      const stripePriceId = product?.stripePriceId as string | undefined;

      if (!stripePriceId || !stripePriceId.startsWith("price_")) {
        throw new Error(`Stripe Price ID manquant/invalide pour: ${productKey}`);
      }
      return { price: stripePriceId, quantity: 1 };
    });

    const singleProductKey = cleaned.length === 1 ? cleaned[0] : null;

    // ✅ IMPORTANT : on force l'email Stripe = email du compte connecté
    // (comme ça, le client ne peut pas payer "pour quelqu'un d'autre" et l'accès reste cohérent)
    const stripeEmail = requesterEmail;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      allow_promotion_codes: true,

      customer_email: stripeEmail,

      success_url: `${baseUrl}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement/cancel`,

      metadata: {
        requesterEmail, // utile pour suivi / webhook / debug
        ...(singleProductKey ? { productKey: singleProductKey } : {}),
        productKeys: cleaned.join(","),
        count: String(cleaned.length),
      },
      payment_intent_data: {
        metadata: {
          requesterEmail,
          ...(singleProductKey ? { productKey: singleProductKey } : {}),
          productKeys: cleaned.join(","),
          count: String(cleaned.length),
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe n'a pas renvoyé d'URL." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur serveur Stripe" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
