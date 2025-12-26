"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CART_KEY = "copyshop_ia_cart";

type CartPayload = {
  items?: Array<{ title?: string; productKey?: string }>;
  updatedAt?: string;
};

function readCartItems() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartPayload;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return items.map((it) => ({
      title: String(it?.title ?? "Produit"),
      productKey: String(it?.productKey ?? ""),
    }));
  } catch {
    return [];
  }
}

export default function SuccessPage() {
  const [items, setItems] = useState<Array<{ title: string; productKey: string }>>([]);

  useEffect(() => {
    const beforeClear = readCartItems();
    setItems(beforeClear);

    // ✅ clear panier
    try {
      localStorage.removeItem(CART_KEY);
    } catch {}

    // ✅ update badge
    window.dispatchEvent(new Event("copyshop_cart_updated"));
  }, []);

  const hasIaPack = useMemo(() => {
    return items.some((it) => it.productKey === "ia-basic" || it.productKey === "ia-premium" || it.productKey === "ia-ultime");
  }, [items]);

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto", color: "#eef1ff" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Paiement confirmé ✅</h1>

      {hasIaPack ? (
        <p style={{ opacity: 0.9, marginTop: 10 }}>
          Merci ! Ton paiement a bien été pris en compte. Ton accès à l’outil IA sera activé après validation.
        </p>
      ) : (
        <p style={{ opacity: 0.9, marginTop: 10 }}>
          Merci ! Ton paiement a bien été pris en compte. Tu recevras la suite par WhatsApp / email selon le service.
        </p>
      )}

      {!!items.length && (
        <div style={{ marginTop: 14, opacity: 0.9 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Résumé :</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {items.map((it, idx) => (
              <li key={idx}>{it.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
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
          href="/panier"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            color: "white",
            textDecoration: "none",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
          }}
        >
          Voir le panier
        </Link>
      </div>
    </main>
  );
}
