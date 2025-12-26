// lib/stripe.ts
import "server-only";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY manquante (configure-la dans Vercel ou .env.local)"
  );
}

export const stripe = new Stripe(secretKey, {
  typescript: true,
});
