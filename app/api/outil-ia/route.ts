// app/api/outil-ia/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ThemeAiPayload } from "@/lib/theme-ai-schema";
import {
  buildThemeAiUserPrompt,
  THEME_AI_SYSTEM_PROMPT,
} from "@/lib/theme-ai-prompt";
import * as dns from "dns/promises";
import * as net from "net";

type RequestBody = {
  productUrl?: string;
  imageBase64?: string | null;
  productKey?: string;
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

/** --- SSRF guard --- */
function isPrivateIp(ip: string) {
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

  if (net.isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fe80:")) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    return false;
  }

  return true;
}

async function isSafeToFetchUrl(urlStr: string) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();

    if (host === "localhost" || host.endsWith(".localhost")) return false;

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
    const html = text.slice(0, 1_200_000);

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
      if (
        typeof pickOffer?.price === "string" ||
        typeof pickOffer?.price === "number"
      ) {
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

function isValidThemeAiPayload(parsed: any): parsed is ThemeAiPayload {
  return !!(
    parsed &&
    parsed.meta &&
    parsed.brand &&
    parsed.colors &&
    parsed.hero &&
    parsed.announcementBar &&
    parsed.homeSections &&
    Array.isArray(parsed.homeSections?.benefits) &&
    parsed.homeSections?.impact &&
    Array.isArray(parsed.homeSections?.storySlides) &&
    Array.isArray(parsed.faq) &&
    parsed.newsletter &&
    parsed.contact &&
    parsed.policies &&
    parsed.assets &&
    typeof parsed.brand.storeName === "string" &&
    typeof parsed.brand.tagline === "string" &&
    typeof parsed.brand.brandTone === "string" &&
    typeof parsed.hero.title === "string" &&
    typeof parsed.hero.subheading === "string" &&
    typeof parsed.hero.buttonText === "string" &&
    typeof parsed.announcementBar.text === "string" &&
    Array.isArray(parsed.assets.productImages)
  );
}

function buildThemePreviewForUi(parsed: ThemeAiPayload) {
  return {
    storeName: parsed.brand.storeName,
    tagline: parsed.brand.tagline,
    brandTone: parsed.brand.brandTone,
    homepageSections: [
      parsed.hero.title,
      ...parsed.homeSections.benefits.map((item) => item.title),
      "FAQ",
      "Newsletter",
      "Contact",
    ]
      .filter(Boolean)
      .slice(0, 8),
    productPageBlocks: [
      "Hero",
      "Branding",
      "Benefits",
      "FAQ",
      "Newsletter",
      "Contact",
    ],
  };
}

function normalizeThemeAiPayload(params: {
  parsed: ThemeAiPayload;
  productUrl: string;
  pack: string;
  model: string;
  scraped: ScrapedProduct;
  productImages: string[];
  heroImage: string | null;
}) {
  const { parsed, productUrl, pack, model, scraped, productImages, heroImage } =
    params;

  parsed.meta = {
    generator: "copyshopia-theme-v1",
    sourceProductUrl: productUrl,
    pack,
    model,
    niche: safeTrim(parsed.meta?.niche),
    style: safeTrim(parsed.meta?.style),
  };

  parsed.brand.storeName =
    safeTrim(parsed.brand.storeName) ||
    safeTrim(scraped.title) ||
    "Votre Boutique";

  parsed.brand.tagline =
    safeTrim(parsed.brand.tagline) || "Une boutique pensée pour convertir";

  parsed.brand.brandTone =
    safeTrim(parsed.brand.brandTone) || "moderne, vendeur, rassurant";

  parsed.brand.brandStory =
    safeTrim(parsed.brand.brandStory) ||
    "Une marque pensée pour proposer une expérience d'achat claire, rassurante et attractive.";

  parsed.hero.subheading =
    safeTrim(parsed.hero.subheading) || "Votre marque, votre univers";

  parsed.hero.title =
    safeTrim(parsed.hero.title) || "Une boutique pensée pour convertir";

  parsed.hero.buttonText =
    safeTrim(parsed.hero.buttonText) || "Découvrir la boutique";

  parsed.hero.buttonLink = safeTrim(parsed.hero.buttonLink);

  parsed.announcementBar.text =
    safeTrim(parsed.announcementBar.text) ||
    "Qualité • Confiance • Livraison rapide • Service client";

  parsed.homeSections.benefits = Array.isArray(parsed.homeSections.benefits)
    ? parsed.homeSections.benefits
        .map((item) => ({
          title: safeTrim(item?.title),
          text: safeTrim(item?.text),
        }))
        .filter((item) => item.title || item.text)
        .slice(0, 3)
    : [];

  while (parsed.homeSections.benefits.length < 3) {
    parsed.homeSections.benefits.push({
      title: `Avantage ${parsed.homeSections.benefits.length + 1}`,
      text: "Un texte vendeur et rassurant pour mettre en avant votre boutique.",
    });
  }

  parsed.homeSections.impact = {
    title: safeTrim(parsed.homeSections.impact?.title) || "100%",
    subheading:
      safeTrim(parsed.homeSections.impact?.subheading) ||
      "Une boutique alignée avec votre image de marque",
  };

  parsed.homeSections.storySlides = Array.isArray(parsed.homeSections.storySlides)
    ? parsed.homeSections.storySlides
        .map((item) => ({
          subheading: safeTrim(item?.subheading),
          title: safeTrim(item?.title),
          buttonText: safeTrim(item?.buttonText) || "En savoir plus",
        }))
        .filter((item) => item.subheading || item.title || item.buttonText)
        .slice(0, 2)
    : [];

  while (parsed.homeSections.storySlides.length < 2) {
    parsed.homeSections.storySlides.push({
      subheading: "Une identité forte",
      title: "Des visuels, du texte et une structure cohérente",
      buttonText: "En savoir plus",
    });
  }

  parsed.faq = Array.isArray(parsed.faq)
    ? parsed.faq
        .map((item) => ({
          q: safeTrim(item?.q),
          a: safeTrim(item?.a),
        }))
        .filter((item) => item.q || item.a)
        .slice(0, 4)
    : [];

  while (parsed.faq.length < 4) {
    parsed.faq.push({
      q: `Question fréquente ${parsed.faq.length + 1}`,
      a: "Une réponse claire, rassurante et simple pour votre client.",
    });
  }

  parsed.newsletter = {
    title: safeTrim(parsed.newsletter?.title) || "Newsletter",
    text:
      safeTrim(parsed.newsletter?.text) ||
      "Recevez nos nouveautés, nos offres spéciales et nos conseils directement par email.",
    buttonText: safeTrim(parsed.newsletter?.buttonText) || "S'abonner",
  };

  parsed.contact = {
    subheading: safeTrim(parsed.contact?.subheading) || "Contactez-nous",
    title: safeTrim(parsed.contact?.title) || "Une question ?",
    text:
      safeTrim(parsed.contact?.text) ||
      "Notre équipe reste disponible pour vous répondre et vous accompagner.",
  };

  parsed.policies = {
    shipping:
      safeTrim(parsed.policies?.shipping) ||
      "Expédition rapide avec suivi selon la destination.",
    returns:
      safeTrim(parsed.policies?.returns) ||
      "Retours possibles selon les conditions affichées sur la boutique.",
    support:
      safeTrim(parsed.policies?.support) ||
      "Réponse du service client sous 24 à 48h.",
  };

  parsed.assets.logoPrompt =
    safeTrim(parsed.assets.logoPrompt) ||
    `Créer un logo moderne et vendeur pour la marque ${parsed.brand.storeName}.`;

  parsed.assets.heroImagePrompt =
    safeTrim(parsed.assets.heroImagePrompt) ||
    `Créer une image hero cohérente avec la boutique ${parsed.brand.storeName} et le produit source.`;

  parsed.assets.productImages = Array.isArray(parsed.assets.productImages)
    ? uniq([...parsed.assets.productImages, ...productImages])
    : productImages;

  parsed.assets.heroImageUrl = parsed.assets.heroImageUrl || heroImage || null;

  parsed.colors = {
    background: safeTrim(parsed.colors.background) || "#ffffff",
    text: safeTrim(parsed.colors.text) || "#191818",
    primary: safeTrim(parsed.colors.primary) || "#6a2fd6",
    primaryText: safeTrim(parsed.colors.primaryText) || "#ffffff",
    secondary: safeTrim(parsed.colors.secondary) || "#e64aa7",
    secondaryText: safeTrim(parsed.colors.secondaryText) || "#ffffff",
    accent: safeTrim(parsed.colors.accent) || "#ff6f20",
    headerBackground:
      safeTrim(parsed.colors.headerBackground) ||
      safeTrim(parsed.colors.background) ||
      "#ffffff",
    headerText:
      safeTrim(parsed.colors.headerText) ||
      safeTrim(parsed.colors.text) ||
      "#191818",
    footerBackground:
      safeTrim(parsed.colors.footerBackground) || "#f7f7f7",
    footerText:
      safeTrim(parsed.colors.footerText) ||
      safeTrim(parsed.colors.text) ||
      "#191818",
  };

  return parsed;
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

    if (userErr || !email || !userId) {
      return jsonError("Session invalide", 401);
    }

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
        .filter(
          (e: any) => typeof e?.product_key === "string" && rankPack(e.product_key) > 0
        )
        .sort((a: any, b: any) => rankPack(b.product_key) - rankPack(a.product_key))[0] ??
      null;

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

    const scraped = await scrapeProduct(productUrl);
    const productImages = uniq(scraped.images ?? []);
    const heroImage = productImages[0] ?? null;

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const prompt = buildThemeAiUserPrompt({
      productUrl,
      pack: best.product_key,
      scrapedTitle: scraped.title ?? null,
      scrapedDescription: scraped.description ?? null,
      scrapedPrice: scraped.price ?? null,
      scrapedCurrency: scraped.currency ?? null,
      productImages,
    });

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
          { role: "system", content: THEME_AI_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: best.product_key === "ia-basic" ? 0.6 : 0.75,
      }),
    });

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

      const msg =
        openaiJson?.error?.message || raw || "OpenAI request failed (no message)";
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
        content_preview: content.slice(0, 300),
      });
    }

    if (!isValidThemeAiPayload(parsed)) {
      return jsonError("OpenAI a renvoyé un format thème inattendu", 502, {
        model,
        parsed,
      });
    }

    const themeAi = normalizeThemeAiPayload({
      parsed,
      productUrl,
      pack: best.product_key,
      model,
      scraped,
      productImages,
      heroImage,
    });

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

    const uiPreview = buildThemePreviewForUi(themeAi);

    const payloadToStore = {
      themeAi,
      uiPreview,
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
          store_name: themeAi?.brand?.storeName ?? null,
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
      ...uiPreview,
      themeAi,
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