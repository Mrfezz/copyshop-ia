import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return Response.json({ error: "Champs manquants" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "onboarding@resend.dev", // OK pour test
      to: "copyshopp.ia@gmail.com",
      replyTo: email,
      subject: `📩 Nouveau message - ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
