// lib/cart.ts
export const CART_KEY = "copyshop_ia_cart";

export type ProductKey =
  | "ia-basic"
  | "ia-premium"
  | "ia-ultime"
  | "services-essentiel"
  | "services-pro"
  | "services-business"
  | "kbis-24h"
  | "logo-shopify"
  | "nom-domaine"
  | "contact-fournisseur"
  | "shopify-paiement"
  | "reseaux-sociaux"
  | "flyer-image-video"
  | "recharge-ia"
  | "optimisation-boutique";

export type CartItem = {
  id: string;
  productKey: ProductKey;
  title: string;
  priceLabel: string;
  subtitle?: string;
};

type CartPayload = {
  items: CartItem[];
  updatedAt?: string;
};

export function notifyCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("copyshop_cart_updated"));
}

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartPayload;
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  const payload: CartPayload = { items, updatedAt: new Date().toISOString() };
  localStorage.setItem(CART_KEY, JSON.stringify(payload));
  notifyCartUpdated();
}

export function addToCart(item: Omit<CartItem, "id">) {
  const current = readCart();

  // ✅ si même productKey déjà présent, on le remplace (évite doublons)
  const filtered = current.filter((x) => x.productKey !== item.productKey);

  const next: CartItem[] = [
    ...filtered,
    { id: `${item.productKey}-${Date.now()}`, ...item },
  ];

  saveCart(next);
}

export function removeFromCart(id: string) {
  const current = readCart();
  const next = current.filter((x) => x.id !== id);
  saveCart(next);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  notifyCartUpdated();
}
