import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const supported = new Set(["instagram", "facebook", "tiktok"]);
export function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get("platform");
  if (!platform || !supported.has(platform)) return NextResponse.json({ error: "Unsupported social platform." }, { status: 400 });
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  if (!clientId) return NextResponse.json({ error: `${platform[0].toUpperCase()}${platform.slice(1)} OAuth is not configured. Add ${platform.toUpperCase()}_CLIENT_ID and ${platform.toUpperCase()}_CLIENT_SECRET on the server, then try again.` }, { status: 501 });
  const redirectUri = process.env[`${platform.toUpperCase()}_REDIRECT_URI`] ?? `${request.nextUrl.origin}/api/social/callback/${platform}`;
  const state = crypto.randomUUID();
  const oauthUrl = process.env[`${platform.toUpperCase()}_OAUTH_URL`] ?? {
    instagram: "https://api.instagram.com/oauth/authorize",
    facebook: "https://www.facebook.com/v22.0/dialog/oauth",
    tiktok: "https://www.tiktok.com/v2/auth/authorize/",
  }[platform];
  const scopes = process.env[`${platform.toUpperCase()}_OAUTH_SCOPES`] ?? {
    instagram: "instagram_business_basic,instagram_business_content_publish",
    facebook: "pages_show_list,pages_read_engagement,pages_manage_posts",
    tiktok: "user.info.basic,video.publish",
  }[platform];
  const authorization = new URL(oauthUrl as string);
  authorization.searchParams.set("client_id", clientId);
  authorization.searchParams.set("redirect_uri", redirectUri);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("scope", scopes as string);
  authorization.searchParams.set("state", state);
  const response = NextResponse.json({ authorizationUrl: authorization.toString() });
  response.cookies.set("onepost_oauth_state", `${platform}:${state}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}