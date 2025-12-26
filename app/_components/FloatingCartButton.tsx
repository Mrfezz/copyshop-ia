"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CART_KEY = "copyshop_ia_cart";

function readCartCount(): number {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { items?: any[] };
    return Array.isArray(parsed?.items) ? parsed.items.length : 0;
  } catch {
    return 0;
  }
}

export default function FloatingCartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(readCartCount());

    refresh();

    // ✅ si panier modifié depuis un autre onglet
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) refresh();
    };

    // ✅ si panier modifié dans le même onglet (on dispatch cet event)
    const onCustom = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener("copyshop_cart_updated", onCustom as any);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("copyshop_cart_updated", onCustom as any);
    };
  }, []);

  const badgeText = useMemo(() => {
    if (count <= 0) return null;
    if (count > 99) return "99+";
    return String(count);
  }, [count]);

  return (
    <>
      <Link href="/panier" aria-label="Panier" style={styles.btn} className="floating-cart-btn">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <circle cx="9" cy="21" r="1.6" />
          <circle cx="20" cy="21" r="1.6" />
          <path d="M1.5 2.5h3l2.2 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6l1.4-7.7H6.2" />
        </svg>

        {badgeText && (
          <span aria-label={`${badgeText} article(s) dans le panier`} style={styles.badge}>
            {badgeText}
          </span>
        )}
      </Link>

      <style>{`
        .floating-cart-btn:hover{
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(106,47,214,0.48);
          filter: brightness(1.02);
        }
        .floating-cart-btn:active{
          transform: translateY(0px) scale(0.98);
        }
      `}</style>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    position: "fixed",
    top: 16,
    right: 16,
    left: "auto",
    zIndex: 9999,

    width: 46,
    height: 46,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    textDecoration: "none",

    background: "linear-gradient(135deg, #141a4a 0%, #6a2fd6 55%, #e64aa7 100%)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 10px 25px rgba(106,47,214,0.40)",
    backdropFilter: "blur(6px)",

    transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
  },

  badge: {
    position: "absolute",
    top: -7,
    right: -7,

    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 999,

    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: 11,
    fontWeight: 950,
    lineHeight: 1,

    color: "#0b1026",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(0,0,0,0.10)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.28)",

    boxSizing: "border-box",
    pointerEvents: "none",
  },
};
