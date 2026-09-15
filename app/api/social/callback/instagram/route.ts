import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code"); const returnedState = request.nextUrl.searchParams.get("state"); const storedState = request.cookies.get("onepost_oauth_state")?.value;
  if (!code || !returnedState || storedState !== `instagram:${returnedState}`) return NextResponse.json({ error: "Invalid or expired Instagram OAuth state." }, { status: 400 });
  const clientId = process.env.INSTAGRAM_CLIENT_ID; const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET; const redirectUri = process.env.INSTAGRAM_REDIRECT_URI ?? `${request.nextUrl.origin}/api/social/callback/instagram`;
  if (!clientId || !clientSecret) return NextResponse.json({ error: "Instagram OAuth is not configured on the server." }, { status: 501 });
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", redirect_uri: redirectUri, code });
  const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!tokenResponse.ok) return NextResponse.json({ error: "Instagram rejected the authorization code." }, { status: 502 });
  const token = await tokenResponse.json() as { access_token?: string; user_id?: string; username?: string };
  if (!token.access_token || !token.user_id) return NextResponse.json({ error: "Instagram returned an incomplete account response." }, { status: 502 });
  const supabase = await createClient(); if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.redirect(new URL("/auth/login", request.url));
  const { error } = await supabase.from("social_accounts").upsert({ user_id: user.id, platform: "instagram", platform_user_id: token.user_id, username: token.username ?? null, access_token: token.access_token }, { onConflict: "user_id,platform" });
  if (error) return NextResponse.json({ error: "Instagram connected, but the account could not be saved." }, { status: 500 });
  const response = NextResponse.redirect(new URL("/dashboard", request.url)); response.cookies.delete("onepost_oauth_state"); return response;
}