// app/layout.tsx
import "./globals.css";
import type React from "react";
import type { Metadata } from "next";

import SiteHeader from "./_components/SiteHeader";
import Footer from "./_components/Footer";
import FloatingCartButton from "./_components/FloatingCartButton";
import FloatingAccountButton from "./_components/FloatingAccountButton";

// ✅ Force Next à utiliser les fichiers dans /public
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />

        {/* ✅ Bouton Mon compte flottant visible sur toutes les pages */}
        <FloatingAccountButton />

        {/* ✅ Panier/Achats flottant visible sur toutes les pages */}
        <FloatingCartButton />

        {children}

        <Footer />
      </body>
    </html>
  );
}
