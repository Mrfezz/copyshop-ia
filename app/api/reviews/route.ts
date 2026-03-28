import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name || "Client").trim();
    const reviewText = String(body?.reviewText || "").trim();

    if (!reviewText) {
      return NextResponse.json(
        { ok: false, error: "Avis requis" },
        { status: 400 }
      );
    }

    if (reviewText.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Avis trop court" },
        { status: 400 }
      );
    }

    if (reviewText.length > 1200) {
      return NextResponse.json(
        { ok: false, error: "Avis trop long" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("reviews").insert({
      name: name || "Client",
      review_text: reviewText,
      is_approved: true,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Erreur insertion avis" },
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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, review_text, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Erreur lecture avis" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, reviews: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}