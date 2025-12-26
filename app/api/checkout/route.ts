// app/api/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS, type ProductKey } from "@/lib/products";

function normalizeBaseUrl(raw?: string | null) {
  if (!raw) return null;
  let url = raw.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, "");
  return url;
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
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (host) return normalizeBaseUrl(`${proto}://${host}`);

  const origin = req.headers.get("origin");
  return normalizeBaseUrl(origin);
}

export async function POST(req: Request) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
    }

    const email = (body?.email as string | undefined)?.trim() || undefined;

    // ✅ supporte: { productKey } OU { productKeys: [] }
    const keysRaw: unknown =
      Array.isArray(body?.productKeys) && body.productKeys.length
        ? body.productKeys
        : body?.productKey
          ? [body.productKey]
          : [];

    const productKeys = Array.isArray(keysRaw) ? keysRaw : [];
    const cleaned: ProductKey[] = [];
    const seen = new Set<string>();

    for (const k of productKeys) {
      const kk = String(k) as ProductKey;
      if (!kk) continue;
      if (seen.has(kk)) continue;
      if (!(kk in PRODUCTS)) {
        return NextResponse.json({ error: `Produit invalide: ${kk}` }, { status: 400 });
      }
      seen.add(kk);
      cleaned.push(kk);
    }

    if (!cleaned.length) {
      return NextResponse.json({ error: "Aucun produit à payer" }, { status: 400 });
    }

    // ✅ Base URL
    const baseUrl = getBaseUrl(req);
    if (!baseUrl) {
      return NextResponse.json(
        {
          error:
            "Impossible de déterminer l'URL du site. Renseigne NEXT_PUBLIC_SITE_URL dans Vercel.",
        },
        { status: 500 }
      );
    }

    // ✅ line_items multi-produits (1 paiement, plusieurs articles)
    const line_items = cleaned.map((productKey) => {
      const product = PRODUCTS[productKey] as any;
      const stripePriceId = product?.stripePriceId as string | undefined;

      if (!stripePriceId || !stripePriceId.startsWith("price_")) {
        throw new Error(`Stripe Price ID manquant/invalide pour: ${productKey}`);
      }

      return { price: stripePriceId, quantity: 1 };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      allow_promotion_codes: true,

      ...(email ? { customer_email: email } : {}),

      // ✅ Redirections (pages success/cancel)
      success_url: `${baseUrl}/paiement/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement/cancel`,

      metadata: {
        productKeys: cleaned.join(","),
        count: String(cleaned.length),
      },

      payment_intent_data: {
        metadata: {
          productKeys: cleaned.join(","),
          count: String(cleaned.length),
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe n'a pas renvoyé d'URL de paiement." },
        { status: 500 }
      );
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
