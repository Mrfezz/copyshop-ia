// app/api/me/shops/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function GET(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé (Bearer token manquant)", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);

    const userId = userData?.user?.id ?? null;
    const email = userData?.user?.email ?? null;

    if (userErr || !userId) return jsonError("Session invalide", 401);

    const { data, error } = await supabaseAdmin
      .from("generated_shops")
      .select("id, user_id, email, product_url, pack, store_name, payload, created_at")
      .eq("user_id", userId) // ✅ le plus fiable
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("generated_shops select error:", error);
      return jsonError("Erreur DB (generated_shops)", 500);
    }

    return NextResponse.json({
      shops: data ?? [],
      meta: { userId, email }, // pratique pour debug
    });
  } catch (e: any) {
    console.error("shops api error:", e?.message ?? e);
    return jsonError("Erreur serveur", 500);
  }
}
