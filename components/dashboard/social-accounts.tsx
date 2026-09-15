"use client";
import { useState } from "react";
import { LoaderCircle, Radio } from "lucide-react";

type Platform = "instagram" | "facebook" | "tiktok";
const accounts: { platform: Platform; label: string; color: string }[] = [
  { platform: "instagram", label: "Instagram", color: "#d88972" },
  { platform: "facebook", label: "Facebook", color: "#8aa9d0" },
  { platform: "tiktok", label: "TikTok", color: "#93b4ac" },
];

export function SocialAccountsView() {
  const [loading, setLoading] = useState<Platform | null>(null);
  const [message, setMessage] = useState("");
  async function connect(platform: Platform) {
    setLoading(platform); setMessage("");
    try {
      const response = await fetch(`/api/social/connect?platform=${platform}`);
      const data = await response.json() as { authorizationUrl?: string; error?: string };
      if (data.authorizationUrl) window.location.assign(data.authorizationUrl);
      else setMessage(data.error ?? "This platform is not configured yet.");
    } catch { setMessage("Unable to start the connection. Check the server configuration and try again."); }
    finally { setLoading(null); }
  }
  return <section className="mt-10"><h2 className="text-2xl font-semibold">Social accounts</h2><p className="mt-2 text-sm text-[#829087]">Connect through official OAuth. OnePost never asks for or stores social passwords.</p>{message && <p role="alert" className="mt-5 rounded-xl bg-[#fff1df] px-4 py-3 text-sm text-[#8a5b24]">{message}</p>}<div className="mt-6 grid gap-4 md:grid-cols-3">{accounts.map(account => <div key={account.platform} className="rounded-2xl border border-[#e0e7dd] bg-white p-5"><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-xl" style={{ background: account.color }} /><h3 className="font-semibold">{account.label}</h3></div><p className="mt-5 text-sm text-[#829087]">Not connected</p><button onClick={() => connect(account.platform)} disabled={loading !== null} className="mt-5 w-full rounded-full border border-[#d5ded3] py-2.5 text-sm font-medium disabled:opacity-50">{loading === account.platform ? <><LoaderCircle className="mr-1 inline animate-spin" size={15} /> Checking...</> : <>Connect account <Radio className="ml-1 inline" size={15} /></>}</button></div>)}</div><p className="mt-6 text-xs leading-5 text-[#9aa79e]">Connections require a registered developer app, approved permissions, and server-only OAuth credentials for each platform.</p></section>;
}