import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHOP = process.env.SHOPIFY_SHOP;
const CLIENT_ID = process.env.SHOPIFY_API_KEY;
const CLIENT_SECRET = process.env.SHOPIFY_API_SECRET;
const API_VERSION = "2026-01";

type ShopJson = {
  storeName?: string;
  productTitle?: string;
  productDescription?: string;
  bullets?: string[];
  faq?: Array<{ q?: string; a?: string }>;
  refundPolicySummary?: string;
  shippingInfo?: {
    processingTime?: string;
    deliveryTime?: string;
    tracking?: string;
    notes?: string;
  };
  meta?: {
    pack?: string;
    source?: {
      productUrl?: string;
    };
  };
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getFinalTitle(data: ShopJson) {
  const productTitle = cleanText(data.productTitle);
  const storeName = cleanText(data.storeName);

  if (!productTitle || productTitle.toLowerCase() === "produit inconnu") {
    return storeName || "Produit Copyshop IA";
  }

  return productTitle;
}

function buildDescriptionHtml(data: ShopJson) {
  const parts: string[] = [];

  const productDescription = cleanText(data.productDescription);
  if (productDescription) {
    parts.push(`<p>${escapeHtml(productDescription)}</p>`);
  }

  if (Array.isArray(data.bullets) && data.bullets.length > 0) {
    parts.push("<h3>Points forts</h3>");
    parts.push("<ul>");
    for (const item of data.bullets) {
      const text = cleanText(item);
      if (text) parts.push(`<li>${escapeHtml(text)}</li>`);
    }
    parts.push("</ul>");
  }

  if (data.shippingInfo) {
    const processingTime = cleanText(data.shippingInfo.processingTime);
    const deliveryTime = cleanText(data.shippingInfo.deliveryTime);
    const tracking = cleanText(data.shippingInfo.tracking);
    const notes = cleanText(data.shippingInfo.notes);

    parts.push("<h3>Livraison</h3>");
    parts.push("<ul>");
    if (processingTime) parts.push(`<li><strong>Préparation :</strong> ${escapeHtml(processingTime)}</li>`);
    if (deliveryTime) parts.push(`<li><strong>Livraison :</strong> ${escapeHtml(deliveryTime)}</li>`);
    if (tracking) parts.push(`<li><strong>Suivi :</strong> ${escapeHtml(tracking)}</li>`);
    if (notes) parts.push(`<li><strong>Infos :</strong> ${escapeHtml(notes)}</li>`);
    parts.push("</ul>");
  }

  const refund = cleanText(data.refundPolicySummary);
  if (refund) {
    parts.push("<h3>Retour / remboursement</h3>");
    parts.push(`<p>${escapeHtml(refund)}</p>`);
  }

  if (Array.isArray(data.faq) && data.faq.length > 0) {
    parts.push("<h3>FAQ</h3>");
    for (const item of data.faq) {
      const q = cleanText(item?.q);
      const a = cleanText(item?.a);
      if (!q && !a) continue;

      parts.push("<p>");
      if (q) parts.push(`<strong>${escapeHtml(q)}</strong><br />`);
      if (a) parts.push(`${escapeHtml(a)}`);
      parts.push("</p>");
    }
  }

  const productUrl = cleanText(data.meta?.source?.productUrl);
  if (productUrl) {
    parts.push("<h3>Source produit</h3>");
    parts.push(
      `<p><a href="${escapeHtml(productUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        productUrl
      )}</a></p>`
    );
  }

  return parts.join("");
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ShopJson;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Body JSON invalide" },
        { status: 400 }
      );
    }

    const finalTitle = getFinalTitle(body);
    const descriptionHtml = buildDescriptionHtml(body);
    const vendor = cleanText(body.storeName) || "Copyshop IA";
    const productUrl = cleanText(body.meta?.source?.productUrl);
    const pack = cleanText(body.meta?.pack);

    const accessToken = await getShopifyAccessToken();

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
              vendor,
              status: "DRAFT",
              tags: [
                "copyshop-ia",
                pack ? `pack:${pack}` : "",
                productUrl ? "source:aliexpress" : "",
              ].filter(Boolean),
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