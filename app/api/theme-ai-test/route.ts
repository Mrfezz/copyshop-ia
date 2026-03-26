import { NextResponse } from "next/server";
import { buildThemeFilesFromThemeAi } from "@/lib/theme-ai-to-theme";
import type { ThemeAiPayload } from "@/lib/theme-ai-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const fakeThemeAi: ThemeAiPayload = {
    meta: {
      generator: "copyshopia-theme-v1",
      sourceProductUrl: "https://example.com/product",
      pack: "ia-ultime",
      model: "gpt-4o-mini",
      niche: "general",
      style: "premium",
    },
    brand: {
      storeName: "Copyshop Demo",
      tagline: "Une boutique pensée pour convertir",
      brandTone: "moderne, vendeur, rassurant",
      brandStory:
        "Une marque pensée pour proposer une expérience claire, simple et attractive.",
    },
    colors: {
      background: "#ffffff",
      text: "#191818",
      primary: "#6a2fd6",
      primaryText: "#ffffff",
      secondary: "#e64aa7",
      secondaryText: "#ffffff",
      accent: "#ff6f20",
      headerBackground: "#ffffff",
      headerText: "#191818",
      footerBackground: "#f7f7f7",
      footerText: "#191818",
    },
    hero: {
      subheading: "Votre marque, votre univers",
      title: "Une boutique pensée pour convertir",
      buttonText: "Découvrir la boutique",
      buttonLink: "",
    },
    announcementBar: {
      text: "Qualité • Confiance • Livraison rapide • Service client",
    },
    homeSections: {
      benefits: [
        {
          title: "Une offre claire et convaincante",
          text: "Présentez vos avantages de façon claire et vendeuse.",
        },
        {
          title: "Une boutique pensée pour inspirer confiance",
          text: "Mettez en avant les éléments qui rassurent vos clients.",
        },
        {
          title: "Une expérience moderne et fluide",
          text: "Proposez une boutique agréable à parcourir sur mobile et desktop.",
        },
      ],
      impact: {
        title: "100%",
        subheading: "Une boutique alignée avec votre image de marque",
      },
      storySlides: [
        {
          subheading: "Une identité forte",
          title: "Des visuels, du texte et une structure cohérente",
          buttonText: "En savoir plus",
        },
        {
          subheading: "Une boutique prête à évoluer",
          title: "Modifiable facilement dans Shopify",
          buttonText: "Voir les avantages",
        },
      ],
    },
    faq: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Les délais varient selon la destination et le produit.",
      },
      {
        q: "Puis-je retourner un produit ?",
        a: "Oui, selon les conditions affichées sur la boutique.",
      },
      {
        q: "Comment contacter le service client ?",
        a: "Vous pouvez nous écrire via la page de contact.",
      },
      {
        q: "La qualité est-elle garantie ?",
        a: "Nous sélectionnons nos offres avec soin pour offrir une expérience rassurante.",
      },
    ],
    newsletter: {
      title: "Newsletter",
      text: "Recevez nos nouveautés, nos offres spéciales et nos conseils directement par email.",
      buttonText: "S'abonner",
    },
    contact: {
      subheading: "Contactez-nous",
      title: "Une question ?",
      text: "Notre équipe reste disponible pour vous répondre et vous accompagner.",
    },
    policies: {
      shipping: "Expédition rapide avec suivi selon la destination.",
      returns: "Retours possibles selon les conditions affichées sur la boutique.",
      support: "Réponse du service client sous 24 à 48h.",
    },
    assets: {
      logoPrompt: "Créer un logo moderne et vendeur pour la marque Copyshop Demo.",
      heroImagePrompt: "Créer une image hero cohérente avec une boutique moderne et premium.",
      heroImageUrl: null,
      productImages: [],
    },
  };

  const result = buildThemeFilesFromThemeAi(fakeThemeAi);

  return NextResponse.json(result);
}