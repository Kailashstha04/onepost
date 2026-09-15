import type { SupabaseClient } from "@supabase/supabase-js";

export function subscribeToCommunications(client: SupabaseClient, userId: string, onChange: () => void) {
  const channel = client.channel(`communications:${userId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `user_id=eq.${userId}` }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => { void client.removeChannel(channel); };
}