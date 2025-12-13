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
        /* 📱 MOBILE */
        @media (max-width: 700px) {

          .account-btn {
            top: 18px !important;
            right: 78px !important; /* éloigné du panier */
            padding: 8px !important;
          }

          .account-icon {
            width: 30px !important;
            height: 30px !important;
            font-size: 0.95rem !important;
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
    right: 120, // 📌 Desktop : plus éloigné du panier
    zIndex: 80,

    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",

    textDecoration: "none",
    color: "white",
  },

  icon: {
    width: 34,
    height: 34,

    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.7)", // 📌 même style que dans le menu
    display: "grid",
    placeItems: "center",

    fontSize: "1rem",
    background: "rgba(255,255,255,0.05)",
  },

  text: {
    fontSize: "0.93rem",
    fontWeight: 700,
  },
};
