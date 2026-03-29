import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function strToB64url(s: string) {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function buildInboundReplyTo(email: string, inboundDomain?: string | null) {
  const domain = (inboundDomain ?? "").trim();
  if (!domain || !domain.includes(".")) return null;
  return `reply+${strToB64url(email)}@${domain}`;
}

export async function POST(req: Request) {
  try {
    // ✅ protège l’endpoint (mets ce secret sur Vercel)
    const adminToken = req.headers.get("x-admin-token");
    if (!adminToken || adminToken !== process.env.ADMIN_SUPPORT_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const to = (body?.to ?? "").toString().trim();
    const subject = (body?.subject ?? "Réponse du support Copyshop IA").toString().trim();
    const message = (body?.message ?? "").toString();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing to/message" }, { status: 400 });
    }

    // ✅ envoi email au client
    const from = process.env.CONTACT_FROM_EMAIL!; // ex: "Copyshop IA <support@copyshop-ia.com>"
    const inboundDomain = process.env.RESEND_INBOUND_DOMAIN ?? null;
    // Fallback: si inbound non configuré, on garde reply-to vers la boîte support.
    const replyTo =
      buildInboundReplyTo(to, inboundDomain) ||
      process.env.CONTACT_TO_EMAIL ||
      undefined;

    const sendRes = await resend.emails.send({
      from,
      to,
      subject,
      text: message,
      replyTo,
    });

    if (sendRes.error) {
      return NextResponse.json({ error: sendRes.error.message }, { status: 500 });
    }

    // ✅ log dans la DB avec le même schéma que /api/me/messages et /api/inbound-webhook
    // (sinon les messages support ne remontent pas correctement côté client)
    const { error: dbErr } = await supabaseAdmin.from("messages").insert({
      email: to,
      direction: "received", // reçu par le client
      subject,
      body: message,
      created_at: new Date().toISOString(),
    });

    if (dbErr) {
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: sendRes.data?.id ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
