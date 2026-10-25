import { createBrowserClient } from "@supabase/ssr";

// Placeholder URL/key used during `next build` prerendering when real env vars
// are not available. These are never called at runtime in the browser — the
// AuthContext skips fetches when the Supabase URL is a placeholder.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

  return createBrowserClient(url, key);
}

/** Returns true when real Supabase credentials are configured */
export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url !== PLACEHOLDER_URL;
}
