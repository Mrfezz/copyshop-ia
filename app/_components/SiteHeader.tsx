// app/_components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Formations E-COM", href: "/formation" },
  { label: "Packs IA Shopify", href: "/packs-ia" },
  { label: "Services digitaux", href: "/services-digitaux" },
  { label: "Services à la carte", href: "/services-a-la-carte" },
  { label: "FAQ", href: "/faq" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Contact", href: "/contact" },
  { label: "Compte client", href: "/compte-client" },
];

type SocialLink = {
  name: string;
  href: string;
  bg: string;
  icon: ReactNode;
};

// ✨ Réseaux sociaux couleur
const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/mr.fezzz",
    bg: "linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="5"
          stroke="white"
          strokeWidth="1.6"
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r="4.2"
          stroke="white"
          strokeWidth="1.6"
          fill="none"
        />
        <circle cx="17" cy="7.2" r="1.3" fill="white" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mr.fezzz",
    bg: "#000000",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
        <rect x="11" y="6.5" width="2.4" height="8.5" rx="1.2" fill="white" />
        <circle cx="10" cy="15" r="1.6" fill="white" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    bg: "#1877F2",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
        <path
          d="M13.2 5.5H11c-2.1 0-3.6 1.5-3.6 3.7v2H6.5v2.3H7.4H8v4.9h2.4v-4.9h2.1l.3-2.3H10.4V9.3c0-.9.4-1.4 1.4-1.4h1.4V5.5Z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/33745214922",
    bg: "#25D366",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
        <circle
          cx="12"
          cy="12"
          r="6.2"
          stroke="white"
          strokeWidth="1.7"
          fill="none"
        />
        <text
          x="12"
          y="14"
          textAnchor="middle"
          fontSize="9"
          fill="white"
        >
          ☎
        </text>
      </svg>
    ),
  },
  {
    name: "Snapchat",
    href: "https://www.snapchat.com",
    bg: "#FFFC00",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
        <g stroke="black" strokeWidth="0.9">
          <circle cx="12" cy="10.2" r="3" fill="white" />
          <rect
            x="9"
            y="10"
            width="6"
            height="4.8"
            rx="2.2"
            fill="white"
          />
        </g>
        <circle cx="11" cy="10" r="0.5" fill="black" />
        <circle cx="13" cy="10" r="0.5" fill="black" />
      </svg>
    ),
  },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Ferme le menu quand la route change
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
          {/* Burger */}
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

          {/* Info droite */}
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

      {/* Drawer mobile */}
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
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp / Projet
          </a>
        </nav>

        {/* Footer drawer : Contact + icônes + Mon compte */}
        <div style={styles.drawerFooter}>
          <div style={styles.footerTitle}>Contact</div>

          <div style={styles.socialRow}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                style={{ ...styles.socialIcon, background: s.bg }}
                aria-label={s.name}
                target="_blank"
                rel="noreferrer"
              >
                <span style={styles.srOnly}>{s.name}</span>
                {s.icon}
              </a>
            ))}
          </div>

          <Link href="/compte-client" style={styles.accountLink}>
            <span
              aria-hidden="true"
              style={{
                width: 22,
                height: 22,
                borderRadius: "999px",
                border: "1px solid rgba(148,163,255,0.7)",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
              }}
            >
              👤
            </span>
            <span>Mon compte</span>
          </Link>
        </div>
      </aside>

      {/* Responsive : cache le bloc texte de droite sur mobile */}
      <style>{`
        @media (max-width: 700px) {
          .rightHint { display: none; }
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
    padding: "10px 8px 14px",
    borderTop: "1px solid rgba(120,140,255,0.12)",
    color: "rgba(238,241,255,0.9)",
    fontSize: "0.9rem",
    display: "grid",
    gap: 6,
  },

  footerTitle: {
    fontWeight: 800,
    fontSize: "0.9rem",
  },

  socialRow: {
    marginTop: 4,
    display: "flex",
    justifyContent: "flex-start",
    gap: 8,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.6)",
    display: "grid",
    placeItems: "center",
    color: "#ffffff",
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },

  accountLink: {
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "rgba(238,241,255,0.98)",
    textDecoration: "none",
  },
};
