// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase environment variables. Check your .env.local file.");
}
//import { supabase } from "../../../lib/supabaseClient";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("✅ Supabase URL:", supabaseUrl);
console.log("✅ Supabase Key Loaded:", !!supabaseAnonKey);
