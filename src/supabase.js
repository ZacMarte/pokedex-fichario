import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    '[Supabase] Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY no .env'
  );
}

export const supabase = createClient(url, key);