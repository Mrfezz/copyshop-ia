// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok() {
  return NextResponse.json({ received: true }, { status: 200 });
}
function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

const PACK_KEYS = new Set(["ia-basic", "ia-premium", "ia-ultime"]);
const RECHARGE_KEYS = new Set(["recharge-ia", "ia-recharge-5"]); // compat ancien nom

function normalizeKey(k: string) {
  if (k === "ia-recharge-5") return "recharge-ia";
  return k;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function mapCheckoutStatus(session: Stripe.Checkout.Session) {
  const ps = session.payment_status ?? "unknown";
  if (ps === "paid" || ps === "no_payment_required") return "paid";
  if (ps === "unpaid") return "pending";
  return String(ps);
}

async function resolveProductKeys(session: Stripe.Checkout.Session): Promise<string[]> {
  // 1) metadata.productKeys (de /api/checkout)
  const fromSessionKeys = (session.metadata?.productKeys as string | undefined) ?? "";
  if (fromSessionKeys.trim()) {
    return uniq(
      fromSessionKeys
        .split(",")
        .map((s) => normalizeKey(s.trim()))
        .filter(Boolean)
    );
  }

  // 2) metadata.productKey (fallback)
  const fromSessionKey = session.metadata?.productKey as string | undefined;
  if (fromSessionKey) return [normalizeKey(fromSessionKey)];

  // 3) payment_intent metadata
  if (typeof session.payment_intent === "string") {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);

      const piKeys = (pi.metadata?.productKeys as string | undefined) ?? "";
      if (piKeys.trim()) {
        return uniq(
          piKeys
            .split(",")
            .map((s) => normalizeKey(s.trim()))
            .filter(Boolean)
        );
      }

      const piKey = (pi.metadata?.productKey as string | undefined) ?? undefined;
      if (piKey) return [normalizeKey(piKey)];
    } catch (e) {
      console.warn("⚠️ Impossible PI metadata", e);
    }
  }

  return ["unknown"];
}

async function resolveEmail(session: Stripe.Checkout.Session) {
  const email =
    (session.customer_details?.email as string | null) ??
    (session.customer_email as string | null) ??
    null;

  if (email) return email;

  if (typeof session.customer === "string") {
    try {
      const customer = (await stripe.customers.retrieve(session.customer)) as Stripe.Customer;
      if (customer?.email) return customer.email;
    } catch (e) {
      console.warn("⚠️ Impossible customer email", e);
    }
  }
  return null;
}

function packDefaults(productKey: string) {
  if (productKey === "ia-basic") return { credits_total: 5, unlimited: false };
  if (productKey === "ia-premium") return { credits_total: 15, unlimited: false };
  if (productKey === "ia-ultime") return { credits_total: null as any, unlimited: true };
  return { credits_total: null as any, unlimited: false };
}

async function upsertPurchase(params: {
  productKey: string;
  email: string | null;
  session: Stripe.Checkout.Session;
  status: string;
}) {
  const { productKey, email, session, status } = params;

  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;

  const { error } = await supabaseAdmin.from("purchases").upsert(
    {
      product_key: productKey,
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

  if (error) console.error("❌ Supabase upsert purchases:", error);
  else console.log("✅ Achat enregistré:", { productKey, email, sessionId: session.id, status });

  return stripeCustomerId;
}

async function grantPackEntitlement(params: {
  email: string;
  productKey: string;
  sessionId: string;
  stripeCustomerId: string | null;
}) {
  const { email, productKey, sessionId, stripeCustomerId } = params;

  const defaults = packDefaults(productKey);

  // On lit l’existant pour ne pas écraser credits_used
  const { data: existing } = await supabaseAdmin
    .from("entitlements")
    .select("credits_total, credits_used, unlimited")
    .eq("email", email)
    .eq("product_key", productKey)
    .maybeSingle();

  const creditsUsed = existing?.credits_used ?? 0;
  const unlimited = defaults.unlimited;

  const creditsTotal = unlimited ? null : (existing?.credits_total ?? defaults.credits_total ?? null);

  const { error } = await supabaseAdmin.from("entitlements").upsert(
    {
      email,
      product_key: productKey,
      active: true,
      stripe_session_id: sessionId,
      stripe_customer_id: stripeCustomerId,
      unlimited,
      credits_total: creditsTotal,
      credits_used: creditsUsed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email,product_key" }
  );

  if (error) console.warn("⚠️ Entitlements pack non mis à jour:", error);
  else console.log("✅ Pack activé:", { email, productKey, creditsTotal, unlimited });
}

async function applyRecharge(params: {
  email: string;
  sessionId: string;
  stripeCustomerId: string | null;
  addCredits: number;
}) {
  const { email, sessionId, stripeCustomerId, addCredits } = params;

  // Recharge uniquement si le user a basic OU premium actif
  const { data: ent } = await supabaseAdmin
    .from("entitlements")
    .select("product_key, credits_total, credits_used, unlimited")
    .eq("email", email)
    .eq("active", true)
    .in("product_key", ["ia-premium", "ia-basic"])
    .limit(2);

  // priorité premium si les deux existent
  const picked =
    ent?.find((e: any) => e.product_key === "ia-premium") ??
    ent?.find((e: any) => e.product_key === "ia-basic") ??
    null;

  if (!picked) {
    console.warn("⚠️ Recharge achetée mais aucun pack basic/premium actif:", email);
    return;
  }

  // sécurité (normalement basic/premium => unlimited false)
  if (picked.unlimited) {
    console.warn("⚠️ Recharge ignorée car entitlement illimité:", { email, pack: picked.product_key });
    return;
  }

  const currentTotal = picked.credits_total ?? (picked.product_key === "ia-basic" ? 5 : 15);
  const newTotal = currentTotal + addCredits;

  const { error } = await supabaseAdmin
    .from("entitlements")
    .update({
      credits_total: newTotal,
      stripe_session_id: sessionId,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email)
    .eq("product_key", picked.product_key);

  if (error) console.error("❌ Recharge update entitlements:", error);
  else console.log("✅ Recharge appliquée:", { email, pack: picked.product_key, newTotal });
}

async function handlePaidSession(session: Stripe.Checkout.Session) {
  const productKeys = await resolveProductKeys(session);
  const purchaseKey = productKeys.length === 1 ? productKeys[0] : productKeys.join(",");
  const email = await resolveEmail(session);
  const status = mapCheckoutStatus(session);

  const stripeCustomerId = await upsertPurchase({
    productKey: purchaseKey,
    email,
    session,
    status,
  });

  if (status !== "paid" || !email) return;

  for (const raw of productKeys) {
    const k = normalizeKey(raw);

    // Packs IA
    if (PACK_KEYS.has(k)) {
      await grantPackEntitlement({
        email,
        productKey: k,
        sessionId: session.id,
        stripeCustomerId,
      });
      continue;
    }

    // Recharge
    if (RECHARGE_KEYS.has(k)) {
      await applyRecharge({
        email,
        sessionId: session.id,
        stripeCustomerId,
        addCredits: 5,
      });
    }
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) return bad("Webhook non configuré", 400);

  const buf = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Signature invalide:", err?.message);
    return bad("Signature invalide", 400);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handlePaidSession(session);
      return ok();
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;

      // update status purchase
      const productKeys = await resolveProductKeys(session);
      const purchaseKey = productKeys.length === 1 ? productKeys[0] : productKeys.join(",");

      await supabaseAdmin
        .from("purchases")
        .update({ status: "paid", product_key: purchaseKey, updated_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);

      await handlePaidSession(session);
      return ok();
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await supabaseAdmin
        .from("purchases")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);
      return ok();
    }

    return ok();
  } catch (err: any) {
    console.error("❌ Erreur webhook:", err?.message ?? err);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
