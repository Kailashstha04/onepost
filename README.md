# OnePost

Create once. Publish everywhere. OnePost is a Next.js App Router MVP for drafting, scheduling, and preparing social content for Instagram, Facebook, and TikTok.

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor. It creates profiles, social accounts, media, posts, post platforms, RLS policies, and the private media bucket.
3. In Supabase Auth, add `http://localhost:3000/auth/reset-password` as a redirect URL while developing.
4. Run `npm run dev`.

## Production

Deploy to Vercel and add the same environment variables there. Set the Supabase site URL and redirect URLs to the Vercel domain. Never add `SUPABASE_SERVICE_ROLE_KEY`, OAuth client secrets, or provider access tokens to `NEXT_PUBLIC_*` variables.

Scheduled publishing is intentionally separated from the UI. A production cron/worker should query due `scheduled` posts with the service role, invoke the provider adapter, update each `post_platforms` record, and mark the parent post `published` or `failed`. The browser must not be responsible for keeping that process alive.

## Social integrations

The provider contracts live in `lib/social/types.ts` and `lib/social/providers.ts`. The current adapters fail clearly instead of faking successful publishing. To enable publishing, create official developer apps and OAuth redirect flows for each platform, request only required scopes, encrypt tokens at rest, store them only server-side in `social_accounts`, and verify image/video publishing against each platform's current API requirements. Instagram publishing generally requires a professional account connected to a Facebook Page; TikTok requires an approved Content Posting API app and scopes. Add provider-specific client IDs and secrets as server-only environment variables.

## Inbox and notifications

The unified Inbox and Notifications screens are at `/dashboard/inbox` and `/dashboard/notifications`. They support platform/read filters, search, conversation selection, local reply composition, mark-as-read behavior, and honest empty states. `lib/supabase/realtime.ts` provides the user-scoped Realtime subscription for conversations and notifications.

The messaging provider contract lives in `lib/social/messaging.ts`. Instagram, Facebook, and TikTok adapters currently report unavailable capabilities rather than fabricating messages. Connect each official API through a server-side OAuth/webhook flow before writing rows to Supabase. Verify webhook signatures, validate payloads, rate-limit sends, and keep access tokens out of browser code. Platform permissions are not equivalent: enable only the conversations, replies, comments, mentions, or notification features approved for each app and account.

## Checks

`npm run lint` checks the source. `npm run build` checks the production bundle. Supabase Auth, RLS, storage uploads, and OAuth flows require a configured Supabase project and should be exercised in a staging project before launch.