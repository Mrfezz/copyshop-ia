// app/api/outil-ia/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import * as dns from "dns/promises";
import * as net from "net";

type RequestBody = {
  productUrl?: string;
  imageBase64?: string | null;
  productKey?: string; // optionnel (on n’en dépend pas)
};

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function rankPack(productKey: string) {
  if (productKey === "ia-ultime") return 3;
  if (productKey === "ia-premium") return 2;
  if (productKey === "ia-basic") return 1;
  return 0;
}

function safeTrim(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function isLikelyUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** --- SSRF guard (simple mais utile) --- */
function isPrivateIp(ip: string) {
  // IPv4 private ranges + loopback + link-local
  if (net.isIP(ip) === 4) {
    const parts = ip.split(".").map((x) => Number(x));
    const [a, b] = parts;

    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;

    return false;
  }

  // IPv6: loopback, link-local, unique local
  if (net.isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fe80:")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    return false;
  }

  // inconnu => on bloque par sécurité
  return true;
}

async function isSafeToFetchUrl(urlStr: string) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();

    if (host === "localhost" || host.endsWith(".localhost")) return false;

    // DNS lookup -> toutes les IP doivent être publiques
    const res = await dns.lookup(host, { all: true });
    if (!res || res.length === 0) return false;

    for (const r of res) {
      if (isPrivateIp(r.address)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

type ScrapedProduct = {
  title?: string | null;
  description?: string | null;
  images?: string[];
  price?: string | null;
  currency?: string | null;
  ogImage?: string | null;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function decodeHtmlEntities(s: string) {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&#39;", "'");
}

function pickMeta(html: string, key: string) {
  const re1 = new RegExp(
    `<meta[^>]+property=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+name=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const m = html.match(re1) || html.match(re2);
  return m?.[1] ? decodeHtmlEntities(m[1]).trim() : null;
}

function extractLdJson(html: string): any[] {
  const out: any[] = [];
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw));
    } catch {
      // ignore
    }
  }
  return out;
}

function findProductInLd(ld: any): any | null {
  if (!ld) return null;

  if (Array.isArray(ld)) {
    for (const item of ld) {
      const found = findProductInLd(item);
      if (found) return found;
    }
    return null;
  }

  if (ld && typeof ld === "object") {
    if (Array.isArray(ld["@graph"])) {
      for (const g of ld["@graph"]) {
        const found = findProductInLd(g);
        if (found) return found;
      }
    }

    const t = ld["@type"];
    if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) {
      return ld;
    }
  }

  return null;
}

async function scrapeProduct(urlStr: string): Promise<ScrapedProduct> {
  const empty: ScrapedProduct = { images: [] };

  const safe = await isSafeToFetchUrl(urlStr);
  if (!safe) return empty;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 9000);

  try {
    const res = await fetch(urlStr, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CopyshopIA/1.0; +https://copyshop-ia.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: ctrl.signal,
      redirect: "follow",
    });

    if (!res.ok) return empty;

    const ct = res.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("text/html")) return empty;

    const text = await res.text();
    const html = text.slice(0, 1_200_000); // limite

    const ogTitle = pickMeta(html, "og:title");
    const ogDesc =
      pickMeta(html, "og:description") || pickMeta(html, "description");
    const ogImage = pickMeta(html, "og:image") || pickMeta(html, "twitter:image");

    const ldBlocks = extractLdJson(html);
    let productObj: any | null = null;
    for (const ld of ldBlocks) {
      const found = findProductInLd(ld);
      if (found) {
        productObj = found;
        break;
      }
    }

    const title = (productObj?.name as string) || ogTitle || null;
    const description = (productObj?.description as string) || ogDesc || null;

    const ldImagesRaw = productObj?.image;
    const ldImages =
      typeof ldImagesRaw === "string"
        ? [ldImagesRaw]
        : Array.isArray(ldImagesRaw)
        ? ldImagesRaw
        : [];

    const images = uniq([...(ldImages as string[]), ...(ogImage ? [ogImage] : [])]);

    let price: string | null = null;
    let currency: string | null = null;

    const offers = productObj?.offers;
    const pickOffer = Array.isArray(offers) ? offers[0] : offers;

    if (pickOffer) {
      if (typeof pickOffer?.price === "string" || typeof pickOffer?.price === "number") {
        price = String(pickOffer.price);
      }
      if (typeof pickOffer?.priceCurrency === "string") {
        currency = pickOffer.priceCurrency;
      }
    }

    return {
      title: title ? decodeHtmlEntities(title).trim() : null,
      description: description ? decodeHtmlEntities(description).trim() : null,
      images,
      price,
      currency,
      ogImage: ogImage ? decodeHtmlEntities(ogImage).trim() : null,
    };
  } catch {
    return empty;
  } finally {
    clearTimeout(timeout);
  }
}

function packHintFor(bestKey: string) {
  if (bestKey === "ia-basic") {
    return `PACK BASIC:
- contenu simple mais complet
- 4 sections homepage détaillées max
- FAQ 4 questions
- bullets 6 max
- ton clair, direct, vendeur`;
  }
  if (bestKey === "ia-premium") {
    return `PACK PREMIUM:
- contenu plus persuasif (USP + objections)
- 6 sections homepage détaillées
- FAQ 6 questions
- bullets 8
- ajoute mini "social proof" + garanties`;
  }
  return `PACK ULTIME:
- ultra complet + très vendeur
- 8 sections homepage détaillées
- FAQ 8 questions
- bullets 10
- ajoute: storytelling marque + garanties + upsell/cross-sell + bundle + hooks pub`;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY manquante", 500);
    }

    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé (Bearer token manquant)", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    const email = userData?.user?.email ?? null;
    const userId = userData?.user?.id ?? null;

    if (userErr || !email || !userId) return jsonError("Session invalide", 401);

    let body: RequestBody;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      return jsonError("Body JSON invalide", 400);
    }

    const productUrl = safeTrim(body.productUrl);
    if (!productUrl) return jsonError("productUrl est requis", 400);
    if (!isLikelyUrl(productUrl)) {
      return jsonError("productUrl invalide (http/https uniquement)", 400);
    }

    // 1) récupérer meilleur pack actif
    const { data: ents, error: entErr } = await supabaseAdmin
      .from("entitlements")
      .select("product_key, credits_total, credits_used, unlimited")
      .eq("email", email)
      .eq("active", true)
      .in("product_key", ["ia-basic", "ia-premium", "ia-ultime"]);

    if (entErr) {
      console.error("DB entitlements error:", entErr);
      return jsonError("Erreur DB entitlements", 500);
    }

    const best =
      (ents ?? [])
        .filter((e: any) => typeof e?.product_key === "string" && rankPack(e.product_key) > 0)
        .sort((a: any, b: any) => rankPack(b.product_key) - rankPack(a.product_key))[0] ?? null;

    if (!best) return jsonError("Accès refusé : aucun pack actif", 403);

    const unlimited = Boolean(best.unlimited);
    const creditsUsed = Number(best.credits_used ?? 0);

    let creditsTotal: number | null = null;

    if (!unlimited) {
      creditsTotal = Number(best.credits_total ?? 0);
      const creditsRemaining = Math.max(0, creditsTotal - creditsUsed);
      if (creditsRemaining <= 0) {
        return jsonError("Crédits épuisés. Recharge nécessaire.", 403);
      }
    }

    // 2) scrape fournisseur (titre/desc/images)
    const scraped = await scrapeProduct(productUrl);
    const productImages = uniq(scraped.images ?? []);
    const heroImage = productImages[0] ?? null;

    const packHint = packHintFor(best.product_key);

    const schema = `
Renvoie UNIQUEMENT du JSON VALIDE (pas de texte autour), avec EXACTEMENT ces clés (et types) :

{
  "storeName": string,
  "tagline": string,
  "brandTone": string,

  "homepageSections": string[],
  "productPageBlocks": string[],

  "homepageSectionsDetailed": [
    {
      "title": string,
      "text": string,
      "ctaText": string,
      "ctaLink": string,
      "imageUrl": string | null,
      "imageAlt": string
    }
  ],

  "productTitle": string,
  "priceHint": string | null,
  "productDescription": string,
  "bullets": string[],

  "faq": [{ "q": string, "a": string }],

  "shippingInfo": {
    "processingTime": string,
    "deliveryTime": string,
    "tracking": string,
    "notes": string
  },

  "refundPolicySummary": string,

  "seo": {
    "metaTitle": string,
    "metaDescription": string
  },

  "assets": {
    "productImages": string[],
    "heroImageUrl": string | null,
    "logoPrompt": string,
    "heroImagePrompt": string
  }
}
`.trim();

    const imagesForPrompt = productImages.length
      ? productImages.slice(0, 20).join(", ")
      : "aucune";

    const prompt = `
${packHint}

Tu es un expert e-commerce Shopify (copywriting + structure conversion).
Ta mission: générer une boutique "prête à vendre" en FRANÇAIS.

Produit (données fournisseur):
- productUrl: ${productUrl}
- titre détecté: ${scraped.title ?? "inconnu"}
- description détectée: ${scraped.description ? scraped.description.slice(0, 400) : "inconnue"}
- prix détecté: ${scraped.price ? `${scraped.price} ${scraped.currency ?? ""}` : "inconnu"}
- images détectées (URLs): ${imagesForPrompt}

Règles:
- Le JSON doit être exploitable DIRECT (sans texte autour).
- "homepageSectionsDetailed" = textes vendeurs + CTA concrets.
- "productDescription" = longue description persuasive (bénéfices -> détails -> usage -> garantie).
- "bullets" = avantages orientés bénéfices (pas des généralités).
- "faq" = réponses rassurantes (livraison, retour, qualité, SAV).
- "shippingInfo" et "refundPolicySummary" simples et réalistes.
- "assets.productImages" = reprend les URLs détectées si possible (sinon []),
  "assets.heroImageUrl" = 1ère image si dispo.
- Si aucune image détectée: heroImageUrl=null et prompts très bons.
- "homepageSections" et "productPageBlocks" = version courte (compat UI existante).

${schema}
`.trim();

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Assistant e-commerce / Shopify. Réponds en JSON strict." },
          { role: "user", content: prompt },
        ],
        temperature: best.product_key === "ia-basic" ? 0.6 : 0.75,
      }),
    });

    // lire UNE SEULE FOIS la réponse OpenAI
    const raw = await openaiRes.text();
    let openaiJson: any = null;
    try {
      openaiJson = raw ? JSON.parse(raw) : null;
    } catch {
      openaiJson = null;
    }

    if (!openaiRes.ok) {
      const requestId =
        openaiRes.headers.get("x-request-id") ||
        openaiRes.headers.get("openai-request-id") ||
        null;

      const msg = openaiJson?.error?.message || raw || "OpenAI request failed (no message)";
      const type = openaiJson?.error?.type || null;
      const code = openaiJson?.error?.code || null;

      console.error("OpenAI refused:", {
        status: openaiRes.status,
        requestId,
        type,
        code,
        msg,
      });

      return jsonError("OpenAI a refusé la requête", 502, {
        openai_status: openaiRes.status,
        openai_message: msg,
        openai_type: type,
        openai_code: code,
        openai_request_id: requestId,
        model,
      });
    }

    const content = openaiJson?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return jsonError("Réponse OpenAI vide", 500, { model });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      return jsonError("OpenAI a renvoyé un JSON invalide", 502, {
        model,
        content_preview: content.slice(0, 200),
      });
    }

    // validation minimum du format "prêt à vendre"
    const ok =
      parsed &&
      typeof parsed.storeName === "string" &&
      typeof parsed.tagline === "string" &&
      typeof parsed.brandTone === "string" &&
      Array.isArray(parsed.homepageSectionsDetailed) &&
      typeof parsed.productTitle === "string" &&
      typeof parsed.productDescription === "string" &&
      Array.isArray(parsed.bullets) &&
      Array.isArray(parsed.faq) &&
      parsed.shippingInfo &&
      typeof parsed.shippingInfo.processingTime === "string" &&
      typeof parsed.shippingInfo.deliveryTime === "string" &&
      typeof parsed.shippingInfo.tracking === "string" &&
      typeof parsed.shippingInfo.notes === "string" &&
      typeof parsed.refundPolicySummary === "string" &&
      parsed.assets &&
      Array.isArray(parsed.assets.productImages);

    if (!ok) {
      return jsonError("OpenAI a renvoyé un format inattendu", 502, { model, parsed });
    }

    // force images scrapées si besoin
    parsed.assets.productImages = Array.isArray(parsed.assets.productImages)
      ? uniq([...parsed.assets.productImages, ...productImages])
      : productImages;

    if (!parsed.assets.heroImageUrl) parsed.assets.heroImageUrl = heroImage;

    if (!parsed.productTitle || parsed.productTitle === "Produit") {
      parsed.productTitle = scraped.title ?? parsed.productTitle;
    }

    if (!parsed.priceHint && scraped.price) {
      parsed.priceHint = `${scraped.price}${scraped.currency ? ` ${scraped.currency}` : ""}`;
    }

    // 3) consommer 1 crédit (si pas illimité)
    let creditsRemainingAfter: number | null = null;

    if (!unlimited) {
      const nextUsed = creditsUsed + 1;

      const { error: updErr } = await supabaseAdmin
        .from("entitlements")
        .update({
          credits_used: nextUsed,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email)
        .eq("product_key", best.product_key);

      if (updErr) console.error("❌ credits update error:", updErr);

      creditsRemainingAfter =
        creditsTotal === null ? null : Math.max(0, creditsTotal - nextUsed);
    }

    // 4) sauvegarder la génération dans Supabase (Mes boutiques)
    const payloadToStore = {
      ...parsed,
      meta: {
        pack: best.product_key,
        model,
        source: {
          productUrl,
          scraped: {
            title: scraped.title ?? null,
            hasImages: productImages.length > 0,
            imagesCount: productImages.length,
          },
        },
      },
    };

    let savedShopId: string | null = null;
    let savedCreatedAt: string | null = null;
    let saveError: string | null = null;

    try {
      const { data: saved, error: saveErr } = await supabaseAdmin
        .from("generated_shops")
        .insert({
          user_id: userId,
          email,
          product_url: productUrl,
          pack: best.product_key,
          store_name: parsed?.storeName ?? null,
          payload: payloadToStore,
        })
        .select("id, created_at")
        .single();

      if (saveErr) {
        console.error("❌ save generated_shops error:", saveErr);
        saveError = saveErr.message;
      } else {
        savedShopId = saved?.id ?? null;
        savedCreatedAt = saved?.created_at ?? null;
      }
    } catch (e: any) {
      console.error("❌ save generated_shops exception:", e?.message ?? e);
      saveError = e?.message ?? "save exception";
    }

    return NextResponse.json({
      ...parsed,
      meta: {
        pack: best.product_key,
        creditsRemaining: unlimited ? null : creditsRemainingAfter,
        model,
        savedShopId,
        savedCreatedAt,
        saveError,
        source: {
          productUrl,
          scraped: {
            title: scraped.title ?? null,
            hasImages: productImages.length > 0,
            imagesCount: productImages.length,
          },
        },
      },
    });
  } catch (e: any) {
    console.error("outil-ia server error:", e?.message ?? e);
    return jsonError("Erreur serveur", 500);
  }
}
