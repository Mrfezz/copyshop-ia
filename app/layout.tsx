// app/layout.tsx
import "./globals.css";
import type React from "react";

import SiteHeader from "./_components/SiteHeader";
import Footer from "./_components/Footer";
import FloatingCartButton from "./_components/FloatingCartButton";
import FloatingAccountButton from "./_components/FloatingAccountButton"; // ✅ nouveau

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
