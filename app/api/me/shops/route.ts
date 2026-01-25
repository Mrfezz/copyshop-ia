// app/api/me/shops/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    const email = userData?.user?.email ?? null;
    if (userErr || !email) return jsonError("Session invalide", 401);

    const { data, error } = await supabaseAdmin
      .from("generated_shops")
      .select("id, email, product_url, pack, store_name, payload, created_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("generated_shops select error:", error);
      return jsonError("Erreur DB (generated_shops)", 500);
    }

    return NextResponse.json({ shops: data ?? [] });
  } catch (e) {
    console.error("shops api error:", e);
    return jsonError("Erreur serveur", 500);
  }
}
