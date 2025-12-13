"use client";

import Link from "next/link";
import React from "react";

export default function FloatingAccountButton() {
  return (
    <Link href="/compte-client" aria-label="Mon compte" style={styles.wrap}>
      <span style={styles.icon}>👤</span>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "fixed",
    top: 16,         // 🔥 même hauteur que le panier
    right: 72,       // 🔥 à gauche du panier (46px large + ~10px d'espace)
    zIndex: 9999,

    width: 46,
    height: 46,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    textDecoration: "none",
  },

  icon: {
    width: 32,
    height: 32,
    borderRadius: 999,

    // 🔥 contour dégradé rose/violet très fin
    border: "2px solid transparent",
    background:
      "linear-gradient(rgba(15,15,30,0.95), rgba(15,15,30,0.95)) padding-box," +
      "linear-gradient(90deg, #e64aa7, #6a2fd6) border-box",

    display: "grid",
    placeItems: "center",
    fontSize: "1.05rem",
    color: "white",
  },
};
