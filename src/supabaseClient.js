import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This will tell us exactly what is missing in the Console (F12)
console.log("Checking Supabase Config...");
console.log("URL exists:", !!supabaseUrl);
console.log("Key exists:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing! Check your .env file and restart Vite.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)