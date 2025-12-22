// app/api/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS, type ProductKey } from "@/lib/products";

function normalizeBaseUrl(raw?: string | null) {
  if (!raw) return null;
  let url = raw.trim();

  // si l'utilisateur a mis "www.domaine.com" sans protocole
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // enlever slash final
  url = url.replace(/\/+$/, "");
  return url;
}

function getBaseUrl(req: Request) {
  // 1) priorité à l'env
  const fromEnv = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL
  );
  if (fromEnv) return fromEnv;

  // 2) fallback via headers (utile sur Vercel si env absente)
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";

  if (!host) return null;
  return normalizeBaseUrl(`${proto}://${host}`);
}

export async function POST(req: Request) {
  try {
    // Lire le body JSON proprement
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
    }

    const productKey = body?.productKey as ProductKey | undefined;

    // ✅ Vérif produit
    if (!productKey || !(productKey in PRODUCTS)) {
      return NextResponse.json({ error: "Produit invalide" }, { status: 400 });
    }

    const product = PRODUCTS[productKey];

    // ✅ Vérif Stripe Price ID (obligatoire et doit commencer par price_)
    const stripePriceId = (product as any).stripePriceId as string | undefined;
    if (!stripePriceId || !stripePriceId.startsWith("price_")) {
      return NextResponse.json(
        { error: "Stripe Price ID manquant ou invalide pour ce produit." },
        { status: 400 }
      );
    }

    // ✅ Base URL
    const baseUrl = getBaseUrl(req);
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Impossible de déterminer l'URL du site (NEXT_PUBLIC_SITE_URL manquante)." },
        { status: 500 }
      );
    }

    // ✅ Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,

      // (Optionnel) utile pour retrouver côté Stripe
      client_reference_id: productKey,

      // ✅ Redirections (tes URLs)
      success_url: `${baseUrl}/compte-client?success=1&product=${encodeURIComponent(
        productKey
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement?canceled=1&product=${encodeURIComponent(
        productKey
      )}`,

      // ✅ metadata (session)
      metadata: {
        productKey,
        productName: product.name,
        priceLabel: product.priceLabel,
      },

      // ✅ metadata aussi sur PaymentIntent (pratique en webhook)
      payment_intent_data: {
        metadata: {
          productKey,
          productName: product.name,
          priceLabel: product.priceLabel,
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

// (Optionnel) si jamais quelqu’un appelle GET par erreur
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
