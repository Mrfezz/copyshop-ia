// app/paiement/success/clear-cart-client.tsx
"use client";

import { useEffect } from "react";

const CART_KEY = "copyshop_ia_cart";

export default function ClearCartClient({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    try {
      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("copyshop_cart_updated"));
    } catch {
      // ignore
    }
  }, [enabled]);

  return null;
}
