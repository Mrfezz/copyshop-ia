import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHOP = process.env.SHOPIFY_SHOP;
const CLIENT_ID = process.env.SHOPIFY_API_KEY;
const CLIENT_SECRET = process.env.SHOPIFY_API_SECRET;
const API_VERSION = "2026-01";

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
            query {
              products(first: 3) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          `,
        }),
        cache: "no-store",
      }
    );

    const graphqlText = await graphqlResponse.text();

    if (!graphqlResponse.ok) {
      throw new Error(`GraphQL failed (${graphqlResponse.status}): ${graphqlText}`);
    }

    const graphqlJson = JSON.parse(graphqlText);

    return NextResponse.json({
      ok: true,
      shop: SHOP,
      products: graphqlJson?.data?.products?.edges ?? [],
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