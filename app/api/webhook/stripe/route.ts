// app/api/inbound-webhook/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** b64url -> string */
function b64urlToStr(token: string) {
  let t = token.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  return Buffer.from(t, "base64").toString("utf8");
}

/** hex -> string */
function hexToStr(token: string) {
  if (!/^[a-f0-9]+$/i.test(token) || token.length % 2 !== 0) {
    throw new Error("invalid hex token");
  }
  return Buffer.from(token, "hex").toString("utf8");
}

function decodeTokenToEmail(token: string): string | null {
  const raw = token.trim();

  // Nouveau format (hex)
  try {
    const emailHex = hexToStr(raw).trim().toLowerCase();
    if (emailHex.includes("@")) return emailHex;
  } catch {}

  // Ancien format (base64url) conservé pour rétrocompatibilité
  try {
    const emailB64 = b64urlToStr(raw).trim().toLowerCase();
    if (emailB64.includes("@")) return emailB64;
  } catch {}

  return null;
}

/**
 * Cherche reply+<TOKEN>@xxx
 * où TOKEN = hex(emailClient) (ou base64url historique)
 */
function extractUserEmailFromTo(to: any): string | null {
  const list: string[] = [];

  if (typeof to === "string") list.push(to);

  if (Array.isArray(to)) {
    for (const item of to) {
      if (typeof item === "string") list.push(item);
      else if (item?.email) list.push(String(item.email));
      else if (item?.address) list.push(String(item.address));
    }
  }

  if (to?.email) list.push(String(to.email));
  if (to?.address) list.push(String(to.address));

  for (const addr of list) {
    // Accepte aussi les formats:
    // - "reply+token@domain.tld"
    // - "Name <reply+token@domain.tld>"
    // - "mailto:reply+token@domain.tld"
    const normalized = String(addr).trim();
    const m = normalized.match(/reply\+([a-zA-Z0-9_-]+)@/i);
    if (!m) continue;
    const email = decodeTokenToEmail(m[1]);
    if (email) return email;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const apiKey = process.env.RESEND_API_KEY;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "RESEND_WEBHOOK_SECRET manquant" },
        { status: 500 }
      );
    }
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY manquant" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // ⚠️ IMPORTANT : RAW body pour la signature
    const payload = await req.text();

    const id = req.headers.get("svix-id");
    const timestamp = req.headers.get("svix-timestamp");
    const signature = req.headers.get("svix-signature");

    if (!id || !timestamp || !signature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    // Vérif signature
    const result: any = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });

    // Pas un email reçu -> OK
    if (!result || result.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const emailId = result?.data?.email_id;
    if (!emailId) {
      return NextResponse.json({ ok: true, ignored: "no-email-id" });
    }

    // Récupère le contenu complet
    const { data: email, error } = await resend.emails.receiving.get(emailId);
    if (error) throw new Error(error.message);

    // Email client depuis "to" (reply+TOKEN@...)
    const userEmail =
      extractUserEmailFromTo((email as any)?.to) ||
      extractUserEmailFromTo(result?.data?.to);

    if (!userEmail) {
      console.log("inbound ignored: no-user-email", {
        to_email: (email as any)?.to,
        to_event: result?.data?.to,
      });
      return NextResponse.json({ ok: true, ignored: "no-user-email" });
    }

    const subject =
      (email as any)?.subject ?? result?.data?.subject ?? "(sans sujet)";

    const bodyText = (email as any)?.text || "";
    const bodyHtml = (email as any)?.html || "";
    const body = bodyText || bodyHtml || "";

    // ✅ INSERT : colonne "body" (aligné avec /api/me/messages GET/POST)
    const { error: dbErr } = await supabaseAdmin.from("messages").insert({
      email: userEmail,
      direction: "received",
      subject,
      body,
      created_at: new Date().toISOString(),
    });

    if (dbErr) throw new Error(dbErr.message);

    console.log("✅ inbound saved", { userEmail, subject });

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("Inbound webhook error:", e?.message ?? e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
