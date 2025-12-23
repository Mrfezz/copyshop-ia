import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function rankPack(productKey: string) {
  if (productKey === "ia-ultime") return 3;
  if (productKey === "ia-premium") return 2;
  if (productKey === "ia-basic") return 1;
  return 0;
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = userData.user.email;

  const { data, error } = await supabaseAdmin
    .from("entitlements")
    .select("product_key, active, credits_total, credits_used, unlimited")
    .eq("email", email)
    .eq("active", true);

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const best =
    (data ?? []).sort((a, b) => rankPack(b.product_key) - rankPack(a.product_key))[0] ?? null;

  if (!best) {
    return NextResponse.json({ pack: null, creditsRemaining: 0 }, { status: 200 });
  }

  const creditsRemaining = best.unlimited
    ? null
    : Math.max(0, (best.credits_total ?? 0) - (best.credits_used ?? 0));

  return NextResponse.json({
    pack: best.product_key,
    unlimited: best.unlimited,
    creditsRemaining,
  });
}
