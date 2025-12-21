// lib/stripe.ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY manquante (configure-la dans Vercel ou .env.local)"
  );
}

export const stripe = new Stripe(secretKey, {
  // ✅ Laisse Stripe utiliser la version API de ton compte (celle du dashboard)
  typescript: true,
});
