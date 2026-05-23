import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key (for admin operations)
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey);
}
