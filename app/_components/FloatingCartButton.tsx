"use client";

import React from "react";

export default function FloatingCartButton() {
  return (
    <a href="/panier" aria-label="Panier" style={styles.btn}>
      {/* icône simple et élégante */}
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
    </a>
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

    background:
      "linear-gradient(135deg, #141a4a 0%, #6a2fd6 55%, #e64aa7 100%)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 10px 25px rgba(106,47,214,0.40)",
    backdropFilter: "blur(6px)",

    transition: "transform .18s ease, box-shadow .18s ease, filter .18s ease",
  },
};
