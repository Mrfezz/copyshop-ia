import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function strToHexToken(s: string) {
  return Buffer.from(s.trim().toLowerCase(), "utf8").toString("hex");
}

function normalizeInboundDomain(raw?: string | null) {
  let domain = (raw ?? "").trim().toLowerCase();
  domain = domain.replace(/^['"]+|['"]+$/g, "");
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/\/.*$/, "");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return null;
  return domain;
}

function buildInboundReplyTo(email: string, inboundDomain?: string | null) {
  const domain = normalizeInboundDomain(inboundDomain);
  if (!domain) return null;
  return `reply+${strToHexToken(email)}@${domain}`;
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
    // Si le domaine inbound n'est pas configuré, on bloque explicitement au lieu de fallback.
    const replyTo = buildInboundReplyTo(email, inboundDomain);
    if (!replyTo) {
      return jsonError(
        "RESEND_INBOUND_DOMAIN manquant/invalide: impossible de router les réponses vers la messagerie du site.",
        500,
        { message: inserted }
      );
    }

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

    const sendRes = await resend.emails.send({
      ...payload,
      replyTo,
    });

    if (sendRes.error) {
      console.error("❌ Resend send error:", sendRes.error);
      return jsonError(sendRes.error.message || "Email non envoyé au support", 502, {
        resendError: sendRes.error,
        replyTo,
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
