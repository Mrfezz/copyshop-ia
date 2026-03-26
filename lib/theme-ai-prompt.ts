import { EMPTY_THEME_AI_PAYLOAD } from "@/lib/theme-ai-schema";

type BuildThemeAiPromptParams = {
  productUrl: string;
  pack: string;
  scrapedTitle?: string | null;
  scrapedDescription?: string | null;
  scrapedPrice?: string | null;
  scrapedCurrency?: string | null;
  productImages?: string[];
};

export const THEME_AI_SYSTEM_PROMPT =
  "Tu es un expert Shopify, branding et copywriting e-commerce. Réponds uniquement en JSON valide, sans texte autour.";

function getPackRules(pack: string) {
  if (pack === "ia-basic") {
    return `
PACK BASIC:
- contenu simple, propre et clair
- branding cohérent
- 3 bénéfices max
- 4 FAQ max
- style sobre et vendeur
`;
  }

  if (pack === "ia-premium") {
    return `
PACK PREMIUM:
- branding plus travaillé
- ton plus vendeur
- 3 bénéfices
- 4 FAQ
- storytelling simple
- meilleure cohérence entre couleurs, slogan et hero
`;
  }

  return `
PACK ULTIME:
- branding très travaillé
- ton premium et vendeur
- 3 bénéfices
- 4 FAQ
- storytelling plus fort
- cohérence maximale entre produit, univers de marque, couleurs et homepage
`;
}

export function buildThemeAiUserPrompt(params: BuildThemeAiPromptParams) {
  const schema = JSON.stringify(EMPTY_THEME_AI_PAYLOAD, null, 2);

  const imagesText =
    params.productImages && params.productImages.length > 0
      ? params.productImages
          .slice(0, 10)
          .map((img) => `- ${img}`)
          .join("\n")
      : "Aucune image détectée";

  const detectedPrice =
    params.scrapedPrice && params.scrapedCurrency
      ? `${params.scrapedPrice} ${params.scrapedCurrency}`
      : params.scrapedPrice || "inconnu";

  return `
${getPackRules(params.pack)}

MISSION :
Tu dois générer le JSON IA spécial thème pour une boutique Shopify.

IMPORTANT :
- Réponds uniquement avec du JSON valide.
- Respecte exactement la structure demandée.
- Tous les textes doivent être en FRANÇAIS.
- Le contenu doit être adapté au produit détecté.
- Ne jamais inventer un univers "féminin", "beauté", "homme", "luxe", "tech", etc. si ce n'est pas cohérent avec le produit.
- Le branding doit être neutre au départ puis cohérent avec les infos disponibles.
- Si les informations produit sont faibles, reste sobre, vendeur et universel.
- Ne mets aucun texte hors du JSON.

DONNÉES PRODUIT :
- URL produit : ${params.productUrl}
- Titre détecté : ${params.scrapedTitle || "inconnu"}
- Description détectée : ${(params.scrapedDescription || "inconnue").slice(0, 1200)}
- Prix détecté : ${detectedPrice}
- Images détectées :
${imagesText}

OBJECTIF :
Créer un univers de boutique cohérent pour remplir :
- le branding
- les couleurs
- le hero
- la barre d'annonce
- les sections homepage
- la FAQ
- la newsletter
- le contact
- les policies
- les prompts visuels

STRUCTURE JSON À RESPECTER EXACTEMENT :
${schema}

RÈGLES DE CONTENU :
- brand.storeName = nom de boutique crédible et vendeur
- brand.tagline = slogan court, mémorable
- brand.brandTone = ton de marque clair
- brand.brandStory = mini histoire de marque courte
- colors = palette cohérente avec le produit
- hero = texte principal de la homepage
- announcementBar.text = phrase courte type avantages / promesses
- homeSections.benefits = exactement 3 items
- homeSections.storySlides = exactement 2 items
- faq = exactement 4 questions/réponses
- newsletter = court et vendeur
- contact = rassurant et simple
- policies = réalistes, sobres, crédibles
- assets.logoPrompt = prompt de logo cohérent avec la marque
- assets.heroImagePrompt = prompt d'image hero cohérent avec le produit
- assets.heroImageUrl = null
- assets.productImages = reprendre les URLs images détectées si disponibles, sinon []

Retourne maintenant uniquement le JSON.
`.trim();
}