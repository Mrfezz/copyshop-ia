"use client";

import React from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ProductKey } from "@/lib/products";

export default function CheckoutButton({
  productKey,
  children = "Choisir ce pack",
  className,
}: {
  productKey: ProductKey;
  children?: React.ReactNode;
  className?: string;
}) {
  const onClick = async () => {
    // ✅ 1) récupérer le token si connecté
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    // ✅ 2) appeler ton API checkout avec Authorization
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productKey }),
    });

    const json = await res.json().catch(() => ({}));

    // ✅ pas connecté -> on mémorise l'achat, puis on envoie sur /compte-client
    if (res.status === 401) {
      localStorage.setItem("pendingCheckout", JSON.stringify({ productKey }));
      window.location.href = json.redirectTo || "/compte-client";
      return;
    }

    // ✅ connecté mais bloqué (ex: recharge interdite)
    if (res.status === 403) {
      alert(json.error || "Action refusée");
      return;
    }

    // ✅ OK -> redirection vers Stripe
    if (json.url) {
      window.location.href = json.url;
      return;
    }

    alert(json.error || "Erreur paiement");
  };

  return (
    <button
      onClick={onClick}
      className={
        className ||
        "w-full rounded-xl px-4 py-3 font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
      }
    >
      {children}
    </button>
  );
}
