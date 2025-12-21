// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("❌ Signature Stripe ou STRIPE_WEBHOOK_SECRET manquante");
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  // ✅ le plus fiable : récupérer le RAW body en bytes
  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Erreur vérification webhook Stripe:", err?.message);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    // ✅ 1) Checkout terminé
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // ⚠️ product_key est NOT NULL en DB, donc jamais null ici
      const productKey =
        (session.metadata?.productKey as string | undefined) ?? "unknown";

      const email =
        (session.customer_details?.email as string | null) ??
        (session.customer_email as string | null) ??
        null;

      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : null;

      const status = (session.payment_status ?? "unknown") as string;

      // ✅ Anti-doublons : upsert via stripe_session_id (unique)
      const { error } = await supabaseAdmin
        .from("purchases")
        .upsert(
          {
            product_key: productKey,
            email,
            stripe_session_id: session.id,
            stripe_customer_id: stripeCustomerId,
            amount_total: session.amount_total ?? null,
            currency: session.currency ?? null,
            status,
          },
          { onConflict: "stripe_session_id" }
        );

      if (error) console.error("❌ Erreur Supabase upsert purchases:", error);
      else
        console.log("✅ Achat enregistré:", {
          productKey,
          email,
          sessionId: session.id,
          status,
        });

      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ✅ 2) Paiement async réussi
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { error } = await supabaseAdmin
        .from("purchases")
        .update({ status: "paid" })
        .eq("stripe_session_id", session.id);

      if (error) console.error("❌ Erreur update async_payment_succeeded:", error);
      else console.log("✅ Paiement async confirmé:", session.id);

      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ✅ 3) Paiement async échoué
    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { error } = await supabaseAdmin
        .from("purchases")
        .update({ status: "failed" })
        .eq("stripe_session_id", session.id);

      if (error) console.error("❌ Erreur update async_payment_failed:", error);
      else console.log("⚠️ Paiement async échoué:", session.id);

      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ℹ️ Events non gérés
    console.log("ℹ️ Event Stripe ignoré:", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Erreur handler webhook:", err?.message ?? err);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
