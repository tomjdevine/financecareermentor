import { createClient } from "@supabase/supabase-js";

// Server-only Supabase admin client. DO NOT import this from the client/browser.
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string;

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL env var");
}
if (!SUPABASE_SERVICE_ROLE) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE env var");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});
