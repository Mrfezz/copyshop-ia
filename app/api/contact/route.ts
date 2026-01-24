// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  message?: string;
};

// ✅ Étape 4 : encodage email client dans un reply-to spécial (b64url)
function strToB64url(s: string) {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function POST(req: Request) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.CONTACT_TO_EMAIL;
    const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL;

    // ✅ domaine inbound Resend (ex: "uaerkiichi.resend.app" ou ton domaine inbound)
    const INBOUND_DOMAIN =
      process.env.RESEND_INBOUND_DOMAIN || "uaerkiichi.resend.app";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "RESEND_API_KEY manquante" },
        { status: 500 }
      );
    }
    if (!TO_EMAIL) {
      return NextResponse.json(
        { ok: false, error: "CONTACT_TO_EMAIL manquante" },
        { status: 500 }
      );
    }
    if (!FROM_EMAIL) {
      return NextResponse.json(
        { ok: false, error: "CONTACT_FROM_EMAIL manquante" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Payload;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const subject = `📩 Nouveau message (Copyshop IA) — ${name}`;
    const text = [
      "Nouveau message depuis le formulaire de contact :",
      "",
      `Nom: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Nouveau message (Copyshop IA)</h2>
        <p><b>Nom :</b> ${escapeHtml(name)}</p>
        <p><b>Email :</b> ${escapeHtml(email)}</p>
        <p><b>Message :</b></p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(
          message
        )}</pre>
      </div>
    `;

    // ✅ Reply-To spécial : quand tu réponds dans Gmail, Resend reçoit la réponse
    // et le webhook peut retrouver l'email client via le token.
    const replyTo = `reply+${strToB64url(email)}@${INBOUND_DOMAIN}`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL, // ex: "Copyshop IA <onboarding@resend.dev>"
      to: [TO_EMAIL], // ex: "copyshopp.ia@gmail.com"
      replyTo, // ✅ IMPORTANT : NE PLUS mettre replyTo: email
      subject,
      text,
      html,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Erreur Resend" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
