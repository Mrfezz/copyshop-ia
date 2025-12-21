// lib/products.ts

export const PRODUCTS = {
  // ✅ Services Digitaux
  "services-essentiel": {
    name: "Pack Essentiel (Services Digitaux)",
    priceLabel: "400€",
    stripePriceId: "price_SERVICES_ESSENTIEL", // <-- remplace par ton vrai price_ Stripe
    description:
      "On lance ta boutique Shopify sur des bases solides : design propre, branding cohérent et pages prêtes à convertir. Idéal pour démarrer vite avec une boutique crédible.",
    points: [
      "Nom de domaine + hébergement",
      "Création d’un logo + charte graphique",
      "Jusqu’à 5 pages personnalisées",
      "1 adresse email professionnelle",
    ],
  },

  "services-pro": {
    name: "Pack Pro (Services Digitaux)",
    priceLabel: "600€",
    stripePriceId: "price_SERVICES_PRO", // <-- remplace
    description:
      "Tu veux passer en mode sérieux ? On t’accompagne sur l’administratif et le sourcing produit pour que ton projet soit carré et prêt à vendre dès le lancement.",
    points: [
      "Pack Essentiel inclus",
      "Création d’un Kbis en 48h",
      "Mise en relation avec un fournisseur",
      "Aide à la recherche d’un produit gagnant",
    ],
  },

  "services-business": {
    name: "Pack Business+ (Services Digitaux)",
    priceLabel: "800€",
    stripePriceId: "price_SERVICES_BUSINESS", // <-- remplace
    description:
      "L’option “clé en main” : on prend tout en charge pour un lancement complet. Boutique optimisée, fournisseur fiable, visibilité SEO et réseaux sociaux prêts à scaler.",
    points: [
      "Pack Essentiel + Pack Pro",
      "Activation Shopify Paiement",
      "Contact fournisseur A à Z",
      "Référencement naturel (SEO)",
      "Création pages Instagram/Facebook/TikTok",
      "Flyer adapté Snapchat",
    ],
  },

  // ✅ Packs IA Shopify
  "ia-basic": {
    name: "Pack Basic IA",
    priceLabel: "49,99€",
    stripePriceId: "price_1SgugdIGNjC6wKJRJQY7rkHN", // <-- remplace
    description:
      "Parfait pour débuter : accès à vie à Copyshop IA et génération de 5 boutiques prêtes à vendre. Tu testes ta première niche rapidement sans te prendre la tête.",
    points: [
      "Accès à vie à l’outil IA",
      "Génère 5 boutiques Shopify",
      "À partir d’une image ou d’un lien produit",
      "Textes optimisés + branding auto",
    ],
  },

  "ia-premium": {
    name: "Pack Premium IA",
    priceLabel: "99,90€",
    stripePriceId: "price_IA_PREMIUM", // <-- remplace
    description:
      "Pour ceux qui veulent tester plusieurs niches : 15 boutiques générées avec analyse marketing incluse. Tu gagnes un temps énorme et tu vas droit au rentable.",
    points: [
      "Accès à vie à l’outil IA",
      "Génère 15 boutiques Shopify",
      "Analyse produit + angles marketing",
      "Support prioritaire",
    ],
  },

  "ia-ultime": {
    name: "Pack Ultime IA",
    priceLabel: "149,99€",
    stripePriceId: "price_IA_ULTIME", // <-- remplace
    description:
      "Le pack scaling : génération illimitée de boutiques, branding complet et support VIP. Tu peux enchaîner les tests et passer à l’échelle sans limite.",
    points: [
      "Accès à vie à l’outil IA",
      "Génération illimitée de boutiques",
      "Branding complet + templates sections",
      "Support VIP",
    ],
  },

  // ✅ Services à la carte
  "kbis-24h": {
    name: "Création Kbis en 24h",
    priceLabel: "100€",
    stripePriceId: "price_KBIS_24H", // <-- remplace
    description:
      "On crée ta micro-entreprise / société de A à Z et tu reçois ton Kbis rapidement. Tu gagnes du temps et tu démarres légalement sans stress.",
  },

  "logo-shopify": {
    name: "Logo boutique Shopify",
    priceLabel: "119,99€",
    stripePriceId: "price_LOGO_SHOPIFY", // <-- remplace
    description:
      "Un logo pro + mini charte graphique pour une boutique crédible et mémorable. Parfait pour renforcer la confiance et booster tes ventes.",
  },

  // ⭐ Nouveau service : Nom de domaine
  "nom-domaine": {
    name: "Nom de domaine (mise en ligne + configuration)",
    priceLabel: "49,99€",
    stripePriceId: "price_NOM_DOMAINE", // <-- remplace
    description:
      "Recherche d’un nom de domaine disponible (.fr ou .com), achat + configuration complète sur ta boutique Shopify, mise en ligne sur Google. Validité 1 an (renouvellement non pris en charge).",
  },

  "contact-fournisseur": {
    name: "Contact fournisseur (Chine/Émirats)",
    priceLabel: "120€",
    stripePriceId: "price_CONTACT_FOURNISSEUR", // <-- remplace
    description:
      "On te trouve un fournisseur fiable adapté à ta niche, on vérifie le minimum et on te met en relation. Tu sécurises ton stock et tu évites les galères.",
  },

  "shopify-paiement": {
    name: "Activation Shopify Paiement",
    priceLabel: "39,99€",
    stripePriceId: "price_SHOPIFY_PAIEMENT", // <-- remplace
    description:
      "Configuration complète de Shopify Payments (docs, réglages, tests) pour que tu encaisses sans blocage. Tu vends direct et sereinement.",
  },

  "reseaux-sociaux": {
    name: "Création réseaux sociaux",
    priceLabel: "49,99€",
    stripePriceId: "price_RESEAUX_SOCIAUX", // <-- remplace
    description:
      "Création/optimisation de tes pages Instagram, Facebook et TikTok avec un branding propre. Tu pars avec une présence cohérente prête à attirer des clients.",
  },

  "flyer-image-video": {
    name: "Création flyer image & vidéo",
    priceLabel: "100€",
    stripePriceId: "price_FLYER_IMAGE_VIDEO", // <-- remplace
    description:
      "Un visuel pub pro + une version vidéo/story prête pour Meta, TikTok et Snap. Tu reçois un contenu 100% exploitable pour tes campagnes.",
  },

  "recharge-ia": {
    name: "Recharge boutiques IA",
    priceLabel: "29,99€",
    stripePriceId: "price_RECHARGE_IA", // <-- remplace
    description:
      "Ajoute 5 boutiques IA supplémentaires à ton pack Basic/Premium. Idéal pour tester encore plus de niches et augmenter tes chances de trouver un gagnant.",
  },

  "optimisation-boutique": {
    name: "Optimisation boutique",
    priceLabel: "179,99€",
    stripePriceId: "price_OPTIMISATION_BOUTIQUE", // <-- remplace
    description:
      "Audit complet + optimisation homepage, pages produits et upsells. On améliore la confiance et la conversion pour que ta boutique vende plus.",
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;

// Optionnel mais pratique : type pour un produit
export type Product = (typeof PRODUCTS)[ProductKey];
