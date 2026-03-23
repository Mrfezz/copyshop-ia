import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHOP = process.env.SHOPIFY_SHOP;
const CLIENT_ID = process.env.SHOPIFY_API_KEY;
const CLIENT_SECRET = process.env.SHOPIFY_API_SECRET;
const API_VERSION = "2026-01";

const SHOP_DATA = {
  storeName: "Votre Boutique Chic",
  productTitle: "Produit Inconnu",
  productDescription:
    "Découvrez notre produit phare qui allie style et fonctionnalité. Avec des matériaux de haute qualité, il est conçu pour durer et répondre à tous vos besoins quotidiens. Facile à utiliser, il vous apportera confort et satisfaction à chaque utilisation. Nous garantissons la qualité de nos produits et offrons un service après-vente réactif pour toute question ou problème que vous pourriez rencontrer.",
  bullets: [
    "Matériaux de haute qualité pour une durabilité maximale",
    "Design élégant et moderne qui attire l'œil",
    "Facile à utiliser, idéal pour un usage quotidien",
    "Garantie de satisfaction client à 100%",
    "Livraison rapide et sécurisée",
    "Compatible avec divers accessoires",
    "Écologique et respectueux de l'environnement",
    "Facile à entretenir et à nettoyer",
    "Options de personnalisation disponibles",
    "Parfait pour offrir ou se faire plaisir",
  ],
  faq: [
    {
      q: "Quels sont les délais de livraison ?",
      a: "La livraison prend généralement entre 3 à 7 jours ouvrables.",
    },
    {
      q: "Puis-je retourner un produit ?",
      a: "Oui, vous pouvez retourner un produit dans les 30 jours suivant votre achat.",
    },
    {
      q: "Comment puis-je contacter le service client ?",
      a: "Vous pouvez nous contacter via notre page de contact ou par email.",
    },
    {
      q: "La qualité des produits est-elle garantie ?",
      a: "Oui, tous nos produits sont garantis de haute qualité.",
    },
  ],
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFinalTitle() {
  const title = (SHOP_DATA.productTitle || "").trim();
  if (!title || title.toLowerCase() === "produit inconnu") {
    return SHOP_DATA.storeName;
  }
  return title;
}

function buildDescriptionHtml() {
  const intro = `<p>${escapeHtml(SHOP_DATA.productDescription)}</p>`;

  const bullets = `
    <h3>Points forts</h3>
    <ul>
      ${SHOP_DATA.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;

  const faq = `
    <h3>FAQ</h3>
    ${SHOP_DATA.faq
      .map(
        (item) => `
          <p><strong>${escapeHtml(item.q)}</strong><br />${escapeHtml(item.a)}</p>
        `
      )
      .join("")}
  `;

  return `${intro}${bullets}${faq}`;
}

async function getShopifyAccessToken() {
  if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Variables Shopify manquantes dans .env.local");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(
    `https://${SHOP}.myshopify.com/admin/oauth/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Token request failed (${response.status}): ${text}`);
  }

  const json = JSON.parse(text);

  if (!json?.access_token) {
    throw new Error("Aucun access_token renvoyé par Shopify");
  }

  return json.access_token as string;
}

export async function GET() {
  try {
    const accessToken = await getShopifyAccessToken();

    const finalTitle = getFinalTitle();
    const descriptionHtml = buildDescriptionHtml();

    const graphqlResponse = await fetch(
      `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: `
            mutation productCreate($product: ProductCreateInput!) {
              productCreate(product: $product) {
                product {
                  id
                  title
                  handle
                  status
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            product: {
              title: finalTitle,
              descriptionHtml,
              productType: "Copyshop IA",
              vendor: SHOP_DATA.storeName,
              status: "DRAFT",
            },
          },
        }),
        cache: "no-store",
      }
    );

    const graphqlText = await graphqlResponse.text();

    if (!graphqlResponse.ok) {
      throw new Error(`GraphQL failed (${graphqlResponse.status}): ${graphqlText}`);
    }

    const graphqlJson = JSON.parse(graphqlText);
    const result = graphqlJson?.data?.productCreate;

    if (result?.userErrors?.length) {
      return NextResponse.json(
        {
          ok: false,
          userErrors: result.userErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: result?.product ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Erreur Shopify",
      },
      { status: 500 }
    );
  }
}