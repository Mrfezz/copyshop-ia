// app/layout.tsx
import "./globals.css";
import type React from "react";
import type { Metadata } from "next";

import SiteHeader from "./_components/SiteHeader";
import Footer from "./_components/Footer";
import FloatingCartButton from "./_components/FloatingCartButton";
import FloatingAccountButton from "./_components/FloatingAccountButton";

export const metadata: Metadata = {
  icons: {
    icon: [
      // petit hack anti-cache (tu peux changer v=2 si besoin)
      { url: "/favicon.ico?v=2" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
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
