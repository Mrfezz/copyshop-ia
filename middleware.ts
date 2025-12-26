// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // On prépare une réponse "next" qui servira aussi à écrire les cookies si besoin
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;
  const isOutilIA = pathname === "/outil-ia" || pathname.startsWith("/outil-ia/");

  // On ne protège que /outil-ia
  if (!isOutilIA) return response;

  // 1) Vérif user connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    const url = request.nextUrl.clone();
    url.pathname = "/compte-client";
    const redirect = NextResponse.redirect(url);
    // conserve les cookies potentiellement mis à jour
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // 2) Vérif pack actif (entitlements)
  const { data: ents, error } = await supabase
    .from("entitlements")
    .select("product_key")
    .eq("email", user.email)
    .eq("active", true)
    .limit(1);

  // Si erreur ou aucun pack => redirect vers packs
  if (error || !ents || ents.length === 0) {
    const url = request.nextUrl.clone();
    url.pathname = "/packs-ia";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/outil-ia/:path*"],
};
