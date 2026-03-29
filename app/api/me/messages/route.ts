import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

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

async function getEmailFromAuth(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;

  return data?.user?.email ?? null;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(req: Request) {
  try {
    const email = await getEmailFromAuth(req);
    if (!email) return jsonError("Unauthorized", 401);

    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("id, email, direction, subject, body, created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return jsonError(error.message, 500);

    return NextResponse.json({ messages: data ?? [] });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const email = await getEmailFromAuth(req);
    if (!email) return jsonError("Unauthorized", 401);

    const { subject, body } = (await req.json()) as {
      subject?: string;
      body?: string;
    };

    const cleanSubject = (subject ?? "").trim().slice(0, 120);
    const cleanBody = (body ?? "").trim();

    if (!cleanBody) return jsonError("Message vide.");

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("messages")
      .insert({
        email,
        direction: "outbound",
        subject: cleanSubject || null,
        body: cleanBody,
      })
      .select("id, email, direction, subject, body, created_at")
      .single();

    if (insErr) return jsonError(insErr.message, 500);

    const to = process.env.CONTACT_TO_EMAIL || "copyshop-ia@gmail.com";
    const from = process.env.CONTACT_FROM_EMAIL || "Copyshop IA <onboarding@resend.dev>";
    const inboundDomain = process.env.RESEND_INBOUND_DOMAIN ?? null;

    if (!process.env.RESEND_API_KEY) {
      return jsonError("RESEND_API_KEY manquante", 500, { message: inserted });
    }

    const mailSubject = cleanSubject
      ? `📩 COPYSHOP IA — ${cleanSubject}`
      : `📩 COPYSHOP IA — Nouveau message client`;

    // Important: on route les réponses vers l'inbound Resend pour webhook + stockage DB.
    // Fallback: si pas de domaine inbound configuré, on garde le comportement historique.
    const replyTo = buildInboundReplyTo(email, inboundDomain) ?? email;

    const payload = {
      from,
      to: [to],
      subject: mailSubject,
      text: `Client: ${email}\n\n${cleanBody}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <p><strong>Client :</strong> ${escapeHtml(email)}</p>
          ${cleanSubject ? `<p><strong>Sujet :</strong> ${escapeHtml(cleanSubject)}</p>` : ""}
          <hr />
          <pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(cleanBody)}</pre>
        </div>
      `,
    };

    // Essai 1: reply-to inbound (webhook conversation)
    let sendRes = await resend.emails.send({
      ...payload,
      replyTo,
    });

    // Essai 2 (fallback): si Resend refuse l'adresse inbound, on repasse en mode simple
    if (sendRes.error && replyTo !== email) {
      console.warn("Resend rejected inbound replyTo, retrying with plain email", {
        firstError: sendRes.error,
      });
      sendRes = await resend.emails.send({
        ...payload,
        replyTo: email,
      });
    }

    if (sendRes.error) {
      console.error("❌ Resend send error:", sendRes.error);
      return jsonError(sendRes.error.message || "Email non envoyé au support", 502, {
        resendError: sendRes.error,
        message: inserted,
      });
    }

    return NextResponse.json({
      ok: true,
      message: inserted,
      emailSent: true,
      resendId: sendRes.data?.id ?? null,
    });
  } catch (e: any) {
    console.error("❌ /api/me/messages POST error:", e);
    return jsonError(e?.message ?? "Server error", 500);
  }
}
