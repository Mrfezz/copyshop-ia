"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

export default function FloatingAccountButton() {
  return (
    <>
      <Link href="/compte-client" className="account-btn" style={styles.wrap}>
        <span className="account-icon" style={styles.icon}>👤</span>
      </Link>

      <style>{`
        /* 📱 MOBILE : icône seule + position adaptée */
        @media (max-width: 700px) {
          .account-btn {
            top: 10px !important;
            right: 78px !important;
            padding: 4px !important;
          }

          .account-icon {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    position: "fixed",
    top: 14,            // ⭐ aligné avec le panier
    right: 118,         // ⭐ laisse juste l’espace parfait entre les deux bulles
    zIndex: 80,
    padding: 4,
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: "999px",

    /* ⭐ Dégradé propre rose → violet (bord fin premium) */
    border: "2px solid transparent",
    background:
      "linear-gradient(rgba(15,15,30,0.9), rgba(15,15,30,0.9)) padding-box," +
      "linear-gradient(90deg, #e64aa7, #6a2fd6) border-box",

    display: "grid",
    placeItems: "center",
    fontSize: "1.1rem",
    color: "white",
  },
};
