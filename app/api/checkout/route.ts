// app/api/checkout/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS, type ProductKey } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productKey = body?.productKey as ProductKey | undefined;

    // ✅ Vérif produit
    if (!productKey || !(productKey in PRODUCTS)) {
      return NextResponse.json({ error: "Produit invalide" }, { status: 400 });
    }

    const product = PRODUCTS[productKey];

    // ✅ Vérif Stripe Price ID
    const stripePriceId = (product as any).stripePriceId as string | undefined;
    if (!stripePriceId || !stripePriceId.startsWith("price_")) {
      return NextResponse.json(
        { error: "Stripe Price ID manquant ou invalide pour ce produit." },
        { status: 400 }
      );
    }

    // ✅ URL du site (prod)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL (ou NEXT_PUBLIC_BASE_URL) manquante" },
        { status: 500 }
      );
    }

    // Optionnel : tu peux passer un email client plus tard si tu le récupères
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,

      // ✅ Redirections
      success_url: `${baseUrl}/compte-client?success=1&product=${productKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/paiement?canceled=1&product=${productKey}`,

      // ✅ Métadonnées utiles pour webhook / suivi
      metadata: {
        productKey,
        productName: product.name,
        priceLabel: product.priceLabel,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erreur serveur Stripe" },
      { status: 500 }
    );
  }
}
