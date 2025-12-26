"use client";

import React, { useEffect } from "react";
import Link from "next/link";

const CART_KEY = "copyshop_ia_cart";

export default function SuccessPage() {
  useEffect(() => {
    try {
      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("copyshop_cart_updated"));
    } catch {}
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto", color: "#eef1ff" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Paiement confirmé ✅</h1>
      <p style={{ opacity: 0.9, marginTop: 10 }}>
        Merci ! Ton paiement a bien été pris en compte.
      </p>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Selon le produit acheté, tu recevras la suite (accès / infos / prise en charge) par email ou WhatsApp.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            color: "white",
            textDecoration: "none",
            background: "linear-gradient(90deg, #6a2fd6, #e64aa7)",
          }}
        >
          Retour à l’accueil
        </Link>

        <Link
          href="/compte-client"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            color: "white",
            textDecoration: "none",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          Mon compte
        </Link>
      </div>
    </main>
  );
}
