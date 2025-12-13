"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

export default function FloatingAccountButton() {
  return (
    <>
      <Link href="/compte-client" className="account-btn" style={styles.wrap}>
        <span className="account-icon" style={styles.icon}>
          👤
        </span>
        <span className="account-text" style={styles.text}>
          Mon compte
        </span>
      </Link>

      <style>{`
        @media (max-width: 700px) {
          .account-btn {
            top: 10px !important;
            right: 78px !important;
            padding: 6px !important;
          }

          .account-icon {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.9rem !important;
          }

          .account-text {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    position: "fixed",
    top: 12,     // ⭐️ AJUSTÉ (avant 18) → aligne parfaitement avec le panier
    right: 118,
    zIndex: 80,

    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",

    textDecoration: "none",
    color: "white",
  },

  icon: {
    width: 36,
    height: 36,
    borderRadius: "999px",

    border: "2px solid transparent",
    background:
      "linear-gradient(rgba(15,15,30,0.9), rgba(15,15,30,0.9)) padding-box," +
      "linear-gradient(90deg, #e64aa7, #6a2fd6) border-box",

    display: "grid",
    placeItems: "center",
    fontSize: "1.1rem",
  },

  text: {
    fontSize: "0.95rem",
    fontWeight: 700,
  },
};
