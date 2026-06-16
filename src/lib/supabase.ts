import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cliente Supabase para o browser.
 * Usa createBrowserClient do @supabase/ssr que armazena a sessão
 * em cookies (não localStorage), permitindo que o middleware
 * server-side leia a autenticação corretamente.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
