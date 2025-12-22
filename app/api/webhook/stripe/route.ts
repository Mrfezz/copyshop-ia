// app/api/webhook/stripe/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * ✅ Réponses helpers
 */
function ok() {
  return NextResponse.json({ received: true }, { status: 200 });
}
function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

/**
 * ✅ Map status Stripe -> status DB
 */
function mapCheckoutStatus(session: Stripe.Checkout.Session) {
  // Stripe: paid | unpaid | no_payment_required
  const ps = session.payment_status ?? "unknown";
  if (ps === "paid" || ps === "no_payment_required") return "paid";
  if (ps === "unpaid") return "pending";
  return String(ps);
}

/**
 * ✅ Produit (priorité metadata session, sinon metadata PaymentIntent)
 */
async function resolveProductKey(session: Stripe.Checkout.Session) {
  const direct = session.metadata?.productKey as string | undefined;
  if (direct) return direct;

  if (typeof session.payment_intent === "string") {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
      const fromPi = (pi.metadata?.productKey as string | undefined) ?? undefined;
      if (fromPi) return fromPi;
    } catch (e) {
      console.warn("⚠️ Impossible de récupérer payment_intent metadata", e);
    }
  }

  return "unknown";
}

/**
 * ✅ Email (priorité customer_details.email, sinon customer_email, sinon customer)
 */
async function resolveEmail(session: Stripe.Checkout.Session) {
  const email =
    (session.customer_details?.email as string | null) ??
    (session.customer_email as string | null) ??
    null;

  if (email) return email;

  if (typeof session.customer === "string") {
    try {
      const customer = (await stripe.customers.retrieve(
        session.customer
      )) as Stripe.Customer;

      if (customer?.email) return customer.email;
    } catch (e) {
      console.warn("⚠️ Impossible de récupérer customer email", e);
    }
  }

  return null;
}

/**
 * ✅ Upsert purchase (anti-doublon via stripe_session_id)
 * NOTE: ton schéma purchases doit contenir les colonnes ci-dessous
 */
async function upsertPurchase(params: {
  productKey: string;
  email: string | null;
  session: Stripe.Checkout.Session;
  status: string;
}) {
  const { productKey, email, session, status } = params;

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;

  const { error } = await supabaseAdmin.from("purchases").upsert(
    {
      product_key: productKey, // NOT NULL chez toi
      email,
      stripe_session_id: session.id,
      stripe_customer_id: stripeCustomerId,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" }
  );

  if (error) {
    console.error("❌ Erreur Supabase upsert purchases:", error);
  } else {
    console.log("✅ Achat enregistré:", {
      productKey,
      email,
      sessionId: session.id,
      status,
    });
  }

  return stripeCustomerId;
}

/**
 * ✅ Entitlements : active l'accès au pack pour l'email
 * Table entitlements attendue :
 * - id (serial/bigserial) ou uuid
 * - email text
 * - product_key text
 * - active boolean
 * - stripe_session_id text
 * - stripe_customer_id text (optionnel)
 * - updated_at timestamptz (optionnel)
 * Conflit : unique(email, product_key)
 */
async function grantEntitlement(params: {
  email: string | null;
  productKey: string;
  sessionId: string;
  stripeCustomerId: string | null;
}) {
  const { email, productKey, sessionId, stripeCustomerId } = params;

  if (!email || !productKey || productKey === "unknown") return;

  const { error } = await supabaseAdmin.from("entitlements").upsert(
    {
      email,
      product_key: productKey,
      active: true,
      stripe_session_id: sessionId,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,product_key" }
  );

  if (error) {
    console.error("❌ Erreur upsert entitlements:", error);
  } else {
    console.log("✅ Pack activé (entitlements):", { email, productKey });
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("❌ Signature Stripe ou STRIPE_WEBHOOK_SECRET manquante");
    return bad("Webhook non configuré", 400);
  }

  // ✅ RAW body (obligatoire pour la vérification de signature)
  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Erreur vérification webhook Stripe:", err?.message);
    return bad("Signature invalide", 400);
  }

  try {
    /**
     * ✅ 1) Checkout terminé (peut être paid ou pending)
     */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const productKey = await resolveProductKey(session);
      const email = await resolveEmail(session);
      const status = mapCheckoutStatus(session);

      const stripeCustomerId = await upsertPurchase({
        productKey,
        email,
        session,
        status,
      });

      // ✅ Activation immédiate si paid
      if (status === "paid") {
        await grantEntitlement({
          email,
          productKey,
          sessionId: session.id,
          stripeCustomerId,
        });
      }

      return ok();
    }

    /**
     * ✅ 2) Paiement async réussi -> passer paid + activation
     */
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;

      const productKey = await resolveProductKey(session);
      const email = await resolveEmail(session);

      const { error } = await supabaseAdmin
        .from("purchases")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);

      if (error) console.error("❌ Erreur update async_payment_succeeded:", error);
      else console.log("✅ Paiement async confirmé:", session.id);

      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : null;

      await grantEntitlement({
        email,
        productKey,
        sessionId: session.id,
        stripeCustomerId,
      });

      return ok();
    }

    /**
     * ✅ 3) Paiement async échoué
     */
    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const { error } = await supabaseAdmin
        .from("purchases")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);

      if (error) console.error("❌ Erreur update async_payment_failed:", error);
      else console.log("⚠️ Paiement async échoué:", session.id);

      return ok();
    }

    // ℹ️ Events non gérés
    console.log("ℹ️ Event Stripe ignoré:", event.type);
    return ok();
  } catch (err: any) {
    console.error("❌ Erreur handler webhook:", err?.message ?? err);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
