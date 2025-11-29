// app/api/checkout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PRODUCTS, type ProductKey } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productKey = body?.productKey as ProductKey;

    if (!productKey || !PRODUCTS[productKey]) {
      return NextResponse.json({ error: "Produit invalide" }, { status: 400 });
    }

    const product = PRODUCTS[productKey];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BASE_URL manquante" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.priceId, quantity: 1 }],
      success_url: `${baseUrl}/compte-client?success=1`,
      cancel_url: `${baseUrl}/paiement?canceled=1&product=${productKey}`,
      metadata: { productKey },
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
