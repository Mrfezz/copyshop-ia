// app/api/me/messages/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getEmailFromAuth(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;

  return data?.user?.email ?? null;
}

// ✅ encode l'email en base64url (safe dans une adresse mail)
function strToB64url(s: string) {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
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

    // 1) On stocke dans Supabase (Envoyé)
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

    // 2) On envoie l’email au support (Resend)
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    if (!to || !from) {
      // on laisse quand même le message stocké
      return NextResponse.json({
        ok: true,
        warning: "CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL manquants",
        message: inserted,
      });
    }

    const mailSubject = cleanSubject
      ? `📩 COPYSHOP IA — ${cleanSubject}`
      : `📩 COPYSHOP IA — Nouveau message client`;

    // ✅ IMPORTANT : Reply-To spécial -> quand tu réponds dans Gmail,
    // la réponse va vers Resend inbound -> webhook -> messages reçus côté client
    const inboundDomain = (process.env.RESEND_INBOUND_DOMAIN || "uaerkiichi.resend.app").trim();
    const replyTo = `reply+${strToB64url(email)}@${inboundDomain}`;

    await resend.emails.send({
      from,
      to: [to],
      subject: mailSubject,
      replyTo, // ✅ NE PLUS mettre replyTo: email
      text: `Client: ${email}\n\n${cleanBody}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <p><strong>Client :</strong> ${email}</p>
          ${cleanSubject ? `<p><strong>Sujet :</strong> ${cleanSubject}</p>` : ""}
          <hr />
          <pre style="white-space:pre-wrap">${cleanBody.replaceAll("<", "&lt;")}</pre>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, message: inserted });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", 500);
  }
}
