// app/layout.tsx
import "./globals.css";
import type React from "react";
import type { Metadata } from "next";

import SiteHeader from "./_components/SiteHeader";
import Footer from "./_components/Footer";
import FloatingCartButton from "./_components/FloatingCartButton";
import FloatingAccountButton from "./_components/FloatingAccountButton";

export const metadata: Metadata = {
  title: "Copyshop IA",
  description: "Génère ta boutique Shopify en quelques minutes.",
  icons: {
    icon: [
      { url: "/favicon.ico" }, // fallback universel
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
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

        <FloatingAccountButton />
        <FloatingCartButton />

        {children}

        <Footer />
      </body>
    </html>
  );
}
