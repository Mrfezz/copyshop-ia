// app/api/outil-ia/route.ts
import { NextResponse } from "next/server";

type RequestBody = {
  productUrl?: string;
  imageBase64?: string | null; // on l'accepte, mais on ne s'en sert pas encore
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const productUrl = body.productUrl || "non fourni";

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquante dans .env.local" },
        { status: 500 }
      );
    }

    const prompt = `
Tu es un expert en copywriting e-commerce.
Génère une proposition de boutique Shopify pour ce produit.

Données fournies :
- Lien produit : ${productUrl}

Je veux que tu renvoies UNIQUEMENT un objet JSON avec la structure suivante :

{
  "storeName": "Nom de la boutique",
  "tagline": "Slogan court orienté bénéfice",
  "homepageSections": [
    "Titre d'une section d'accueil",
    "Autre section d'accueil",
    "..."
  ],
  "productPageBlocks": [
    "Bloc important pour la page produit",
    "Autre bloc important",
    "..."
  ],
  "brandTone": "Description du ton de la marque (2-3 phrases)"
}

Pas de texte autour, pas de markdown, pas d'explication. Juste du JSON valide.
`;

    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Tu es un assistant spécialisé en e-commerce et en boutiques Shopify.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("Erreur OpenAI:", errorText);
      return NextResponse.json(
        { error: "Erreur lors de l'appel à l'API OpenAI" },
        { status: 502 }
      );
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Réponse vide de l'API OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erreur dans /api/outil-ia:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
