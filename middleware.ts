// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ évite tout cache sur les routes sensibles
  res.headers.set("Cache-Control", "no-store, max-age=0");

  return res;
}

export const config = {
  matcher: ["/outil-ia/:path*", "/api/outil-ia/:path*"],
};
