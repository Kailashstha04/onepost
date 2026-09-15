import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const supported = new Set(["instagram", "facebook", "tiktok"]);
export function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get("platform");
  if (!platform || !supported.has(platform)) return NextResponse.json({ error: "Unsupported social platform." }, { status: 400 });
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
  if (!clientId) return NextResponse.json({ error: `${platform[0].toUpperCase()}${platform.slice(1)} OAuth is not configured. Add ${platform.toUpperCase()}_CLIENT_ID and ${platform.toUpperCase()}_CLIENT_SECRET on the server, then try again.` }, { status: 501 });
  // TODO: Build the platform-specific authorization URL and state/PKCE flow here.
  return NextResponse.json({ error: `${platform[0].toUpperCase()}${platform.slice(1)} OAuth credentials are present, but the official authorization flow still needs to be configured.` }, { status: 501 });
}