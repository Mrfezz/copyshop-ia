// app/_components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type JSX } from "react";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Formations E-COM", href: "/formation" },
  { label: "Packs IA Shopify", href: "/packs-ia" },
  { label: "Services digitaux", href: "/services-digitaux" },
  { label: "Services à la carte", href: "/services-a-la-carte" },
  { label: "Contact", href: "/contact" },
  { label: "Qui sommes-nous ?", href: "/qui-sommes-nous" },
];

type SocialLink = {
  name: string;
  href: string;
  icon: JSX.Element;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M12 3C7.6 3 4 6.6 4 11c0 4 2.9 7.3 6.8 7.9v-5.6H9.2V11h1.6V9.7c0-2 1-3.1 3.2-3.1h2v2.3h-1.3c-.8 0-1.1.4-1.1 1.1V11h2.3l-.4 2.3h-1.9v5.7C17 18.5 20 15.2 20 11 20 6.6 16.4 3 12 3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/mr.fez___",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
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
        <circle cx="17" cy="7" r="1.3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mr.fezzz",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M15 7.2V10c0 1.9-1.2 3.1-2.9 3.1-1.3 0-2.4 1-2.4 2.4A2.6 2.6 0 0 0 12.5 18c1.7 0 2.9-1.3 2.9-3.1V9.9a4.7 4.7 0 0 0 3.2 1.2V9a3.6 3.6 0 0 1-3.3-2.6L15 6.1V7.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 11.9A2.7 2.7 0 0 1 11.5 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Snapchat",
    href: "https://www.snapchat.com/@mr.fezz?invite_id=-rdCgPvj&locale=fr_FR&share_id=UK77Sd92TDaGvxvhI95X2w&sid=698c777c36ea4bb3aca7b6aabade36e2",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M12 4.5c-2 0-3.3 1.5-3.4 3.3-.1 1.7.2 2.4-.4 3.1-.4.5-1.1.7-1.7.8v1.1c.8.1 1.3.5 1.9 1-.6.4-1.4.7-2.5.9.4.8 1.3 1.4 2.4 1.6.7.1 1.2.5 1.5.9.5.6 1.2 1.2 2.2 1.2s1.7-.6 2.2-1.2c.3-.4.8-.8 1.5-.9 1.1-.2 2-.8 2.4-1.6-1.1-.2-1.9-.5-2.5-.9.6-.5 1.1-.9 1.9-1v-1.1c-.6-.1-1.3-.3-1.7-.8-.6-.7-.3-1.4-.4-3.1C15.3 6 14 4.5 12 4.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/33745214922",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M12 4.5A7.1 7.1 0 0 0 5 11.6c0 1.3.3 2.3.9 3.3L5 19l4.3-1c.9.4 1.9.6 2.7.6a7.1 7.1 0 0 0 0-14.1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.1 10.2c.2-.3.3-.5.6-.4l.9.1c.2 0 .4.2.5.4l.2.6c.1.2 0 .4-.1.5l-.3.3c.4.7.9 1.1 1.6 1.5l.3-.2c.2-.1.4-.2.6-.1l.7.3c.2.1.3.2.4.4l.1.6c0 .2 0 .4-.2.5-.3.3-.9.7-1.6.7-.9 0-1.7-.3-2.5-.8-.7-.4-1.3-1-1.8-1.6-.4-.5-.8-1.1-1-1.8-.1-.6 0-1.1.3-1.5Z"
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

          {/* Info droite (desktop) */}
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
            Contactez-nous / WhatsApp
          </a>
        </nav>

        {/* Footer drawer : icônes centrées + mon compte */}
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

  // Bloc réseaux + mon compte
  drawerFooter: {
    marginTop: 18,
    padding: "14px 10px 18px",
    borderTop: "1px solid rgba(120,140,255,0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },

  socialRow: {
    marginTop: 2,
    display: "flex",
    justifyContent: "center",
    gap: 14,
  },
  socialIcon: {
    width: 40,
    height: 40,
    display: "grid",
    placeItems: "center",
    color: "#ffffff",
    textDecoration: "none",
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
    justifyContent: "center",
    gap: 8,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "rgba(238,241,255,0.98)",
    textDecoration: "none",
  },
};
