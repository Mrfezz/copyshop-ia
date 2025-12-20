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
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
