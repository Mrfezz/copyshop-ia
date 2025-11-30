// app/_components/SiteHeader.tsx
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
  { label: "Compte client", href: "/compte-client" },
];

// ✨ Réseaux sociaux
const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M13 7.5h1.6V5.5H13c-2.2 0-3.6 1.3-3.6 3.5v1.5H8v2h1.4V18h2.1v-5.5h1.7v-2h-1.7V9c0-.9.4-1.5 1.5-1.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mr.fezzz",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="17" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
      >
        <rect
          x="4"
          y="7"
          width="16"
          height="10"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <polygon points="11 10 15 12 11 14" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mr.fezzz",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
      >
        <path
          d="M14 6.5V10.2C14 12 12.8 13 11.3 13c-1.3 0-2.3 1-2.3 2.3A2.7 2.7 0 0 0 11.7 18c1.7 0 2.8-1.3 2.8-3.1v-5a4.5 4.5 0 0 0 3.2 1.3V9a3.4 3.4 0 0 1-3.2-2.5L14 6.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 11.7A2.6 2.6 0 0 1 11 9.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="8" cy="10" r="1.1" fill="currentColor" />
        <rect x="7.3" y="12" width="1.4" height="4.5" fill="currentColor" />
        <path
          d="M12 11.8h1.5a2.6 2.6 0 0 1 2.5 2.6v2.9h-1.7v-2.7c0-.8-.4-1.3-1.1-1.3-.7 0-1.2.5-1.2 1.3v2.7H12v-5.5Z"
          fill="currentColor"
        />
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

      {/* Drawer */}
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

        {/* Footer drawer : seulement icônes + Mon compte */}
        <div style={styles.drawerFooter}>
          <div style={styles.socialRow}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                style={styles.socialIcon}
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
    padding: "14px 12px",
    borderTop: "1px solid rgba(120,140,255,0.12)",
    color: "rgba(238,241,255,0.9)",
    fontSize: "0.9rem",
    display: "grid",
    gap: 8,
  },

  socialRow: {
    marginTop: 4,
    display: "flex",
    justifyContent: "center",
    gap: 8,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: "1px solid rgba(148,163,255,0.6)",
    display: "grid",
    placeItems: "center",
    color: "rgba(238,241,255,0.95)",
    background: "rgba(15,23,42,0.95)",
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
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "rgba(238,241,255,0.98)",
    textDecoration: "none",
  },
};
