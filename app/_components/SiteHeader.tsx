"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Formations E-COM", href: "/formation" },
  { label: "Packs IA Shopify", href: "/packs-ia" },
  { label: "Services digitaux", href: "/services-digitaux" },
  { label: "Services à la carte", href: "/services-a-la-carte" },
  { label: "FAQ", href: "/faq" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Contact", href: "/contact" },
  { label: "Compte client", href: "/compte-client" }, // ✅ FIX ICI
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Ferme le menu quand on change de route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Ferme avec ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.inner}>
          {/* Burger à gauche */}
          <button
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
            style={styles.burger}
          >
            <span style={styles.burgerLine} />
            <span style={styles.burgerLine} />
            <span style={styles.burgerLine} />
          </button>

          {/* Brand */}
          <Link href="/" style={styles.brand}>
            COPYSHOP IA
          </Link>

          {/* Petit espace droite (optionnel) */}
          <div className="rightHint" style={styles.rightHint}>
            by Mr Fez <br />
            +33 7 45 21 49 22
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        style={{
          ...styles.backdrop,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Drawer gauche */}
      <aside
        aria-hidden={!open}
        style={{
          ...styles.drawer,
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div style={styles.drawerTop}>
          <div style={styles.drawerBrand}>COPYSHOP IA</div>
          <button
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        <nav style={styles.navMobile}>
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  ...styles.navMobileLink,
                  ...(active ? styles.navMobileLinkActive : {}),
                }}
              >
                {l.label}
              </Link>
            );
          })}

          <a
            href="https://wa.me/33745214922"
            style={styles.whatsBtn}
          >
            WhatsApp / Projet
          </a>
        </nav>

        <div style={styles.drawerFooter}>
          <div style={{ fontWeight: 800 }}>Contact</div>
          <div style={{ opacity: 0.8 }}>+33 7 45 21 49 22</div>
          <div style={{ opacity: 0.8 }}>Instagram / TikTok : mr.fezzz</div>
        </div>
      </aside>

      {/* Responsive (cache le hint droite sur mobile) */}
      <style>{`
        @media (max-width: 700px) {
          .rightHint { display:none; }
        }
      `}</style>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    backdropFilter: "blur(8px)",
    background: "rgba(9, 13, 32, 0.9)",
    borderBottom: "1px solid rgba(120,140,255,0.18)",
  },
  inner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "10px 14px",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    color: "white",
    fontWeight: 900,
    letterSpacing: "0.04em",
    textDecoration: "none",
    fontSize: "1.05rem",
    justifySelf: "start",
  },
  rightHint: {
    color: "rgba(238,241,255,0.75)",
    fontSize: "0.8rem",
    textAlign: "right",
    lineHeight: 1.2,
  },

  burger: {
    width: 44,
    height: 38,
    borderRadius: 10,
    border: "1px solid rgba(120,140,255,0.25)",
    background: "rgba(255,255,255,0.04)",
    display: "grid",
    placeItems: "center",
    gap: 4,
    cursor: "pointer",
  },
  burgerLine: {
    display: "block",
    width: 20,
    height: 2,
    background: "white",
    borderRadius: 999,
  },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(4,7,20,0.55)",
    zIndex: 55,
    transition: "opacity .2s ease",
  },

  drawer: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "min(86vw, 340px)",
    background: "rgba(9, 13, 32, 0.98)",
    borderRight: "1px solid rgba(120,140,255,0.18)",
    zIndex: 58,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    transition: "transform .25s ease",
    boxShadow: "10px 0 30px rgba(0,0,0,0.45)",
  },

  drawerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 8px 12px",
    borderBottom: "1px solid rgba(120,140,255,0.15)",
  },
  drawerBrand: {
    color: "white",
    fontWeight: 900,
    fontSize: "1.1rem",
    letterSpacing: "0.05em",
  },
  closeBtn: {
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    width: 36,
    height: 36,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "1rem",
  },

  navMobile: {
    marginTop: 10,
    display: "grid",
    gap: 8,
    padding: "6px",
  },
  navMobileLink: {
    color: "rgba(238,241,255,0.95)",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "1rem",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(120,140,255,0.12)",
  },
  navMobileLinkActive: {
    background: "linear-gradient(90deg, #1b2b9d, #6a2fd6)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 8px 18px rgba(106,47,214,0.4)",
  },

  whatsBtn: {
    marginTop: 6,
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: "linear-gradient(90deg, #6a2fd6, #e64aa7)",
    boxShadow: "0 10px 20px rgba(230,74,167,0.35)",
  },

  drawerFooter: {
    marginTop: "auto",
    padding: "14px 12px",
    borderTop: "1px solid rgba(120,140,255,0.12)",
    color: "rgba(238,241,255,0.9)",
    fontSize: "0.9rem",
    display: "grid",
    gap: 4,
  },
};
