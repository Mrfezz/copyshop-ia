// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs"; // important pour avoir le raw body

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("❌ Signature ou secret webhook manquant");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    // Vérification de la signature Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Erreur vérification webhook Stripe:", err.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // On gère uniquement le checkout réussi
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const productKey =
        (session.metadata?.productKey as string | undefined) ?? null;

      const email =
        (session.customer_details?.email as string | null) ??
        (session.customer_email as string | null) ??
        null;

      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : null;

      const { error } = await supabaseAdmin.from("purchases").insert({
        product_key: productKey,
        email,
        stripe_session_id: session.id,
        stripe_customer_id: stripeCustomerId,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.payment_status ?? "paid",
      });

      if (error) {
        console.error("❌ Erreur Supabase insert purchases:", error);
      } else {
        console.log("✅ Achat enregistré dans Supabase pour", productKey, email);
      }
    } catch (err) {
      console.error("❌ Erreur traitement checkout.session.completed:", err);
    }
  } else {
    console.log("ℹ️ Évènement Stripe ignoré:", event.type);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
