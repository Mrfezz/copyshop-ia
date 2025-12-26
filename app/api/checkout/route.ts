// app/api/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS, type ProductKey } from "@/lib/products";

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
    const kk = String(k || "") as ProductKey;
    if (!kk || seen.has(kk)) continue;
    if (!(kk in PRODUCTS)) throw new Error(`Produit invalide: ${kk}`);
    seen.add(kk);
    out.push(kk);
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });

    const email = (body?.email as string | undefined)?.trim() || undefined;

    // ✅ accepte 3 formats :
    // 1) { productKey: "..." }
    // 2) { productKeys: ["...", "..."] }
    // 3) { items: [{ productKey: "..." }, ...] }
    const keysFromProductKey = body?.productKey ? [body.productKey] : [];
    const keysFromProductKeys = Array.isArray(body?.productKeys) ? body.productKeys : [];
    const keysFromItems = Array.isArray(body?.items)
      ? body.items.map((x: any) => x?.productKey).filter(Boolean)
      : [];

    const cleaned = uniqValidKeys([
      ...keysFromProductKey,
      ...keysFromProductKeys,
      ...keysFromItems,
    ]);

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

    // ✅ 1 seule session Stripe avec plusieurs line_items
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
