// app/api/inbound-webhook/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

/** b64url -> string */
function b64urlToStr(token: string) {
  let t = token.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  return Buffer.from(t, "base64").toString("utf8");
}

/**
 * On cherche une adresse du style:
 * reply+<TOKEN>@xxx.resend.app
 * où <TOKEN> = base64url(emailClient)
 */
function extractUserEmailFromTo(to: any): string | null {
  const list: string[] = [];

  if (typeof to === "string") list.push(to);

  if (Array.isArray(to)) {
    for (const item of to) {
      if (typeof item === "string") list.push(item);
      else if (item?.email) list.push(String(item.email));
    }
  }

  if (to?.email) list.push(String(to.email));

  for (const addr of list) {
    const m = addr.match(/^reply\+([^@]+)@/i);
    if (!m) continue;
    try {
      const email = b64urlToStr(m[1]).trim();
      if (email.includes("@")) return email;
    } catch {}
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "RESEND_WEBHOOK_SECRET manquant" },
        { status: 500 }
      );
    }

    // ⚠️ Important: garder le RAW body pour la vérif signature
    const payload = await req.text();

    const id = req.headers.get("svix-id");
    const timestamp = req.headers.get("svix-timestamp");
    const signature = req.headers.get("svix-signature");

    if (!id || !timestamp || !signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    // ✅ Cast en any pour éviter "result is unknown" (TS)
    const result: any = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });

    // Si ce n’est pas un email reçu → on ignore
    if (!result || result.type !== "email.received") {
      return NextResponse.json({ ok: true });
    }

    const emailId = result?.data?.email_id;
    if (!emailId) {
      return NextResponse.json({ ok: true, ignored: "no-email-id" });
    }

    // On récupère le contenu complet de l’email reçu
    const { data: email, error } = await resend.emails.receiving.get(emailId);
    if (error) throw new Error(error.message);

    // On retrouve l’email client depuis le champ "to" (reply+TOKEN@...)
    const userEmail =
      extractUserEmailFromTo((email as any)?.to) ||
      extractUserEmailFromTo(result?.data?.to);

    if (!userEmail) {
      return NextResponse.json({ ok: true, ignored: "no-user-email" });
    }

    const subject = (email as any)?.subject ?? result?.data?.subject ?? "(sans sujet)";

    const bodyText = (email as any)?.text || "";
    const bodyHtml = (email as any)?.html || "";
    const body = bodyText || bodyHtml || "";

    // ✅ IMPORTANT: on insère bien dans la colonne "body" (pas "message")
    const { error: dbErr } = await supabaseAdmin.from("messages").insert({
      email: userEmail,
      direction: "received",
      subject,
      body, // ✅ CHANGÉ ICI
      created_at: new Date().toISOString(),
    });

    if (dbErr) throw new Error(dbErr.message);

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("Inbound webhook error:", e?.message ?? e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
