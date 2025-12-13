"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

export default function FloatingAccountButton() {
  return (
    <>
      <Link href="/compte-client" className="account-btn" style={styles.wrap}>
        <span className="account-icon" style={styles.icon}>👤</span>
        <span className="account-text" style={styles.text}>Mon compte</span>
      </Link>

      <style>{`
        /* 📱 Mobile */
        @media (max-width: 700px) {

          .account-btn {
            top: 18px !important;
            right: 68px !important; /* laisse la place au panier */
            padding: 6px !important;
          }

          .account-icon {
            font-size: 1rem !important;
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
    top: 18,
    right: 110, // aligné à gauche du panier
    zIndex: 80,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    color: "white",
    textDecoration: "none",
  },

  icon: {
    fontSize: "1.2rem",
    display: "grid",
    placeItems: "center",
  },

  text: {
    fontSize: "0.9rem",
    fontWeight: 700,
  },
};
