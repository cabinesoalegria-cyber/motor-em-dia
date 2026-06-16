/**
 * store.ts
 * ────────
 * Re-exports useStore from the Supabase-backed store.
 * All pages that import { useStore } from '@/lib/store' automatically use Supabase.
 * The original Zustand/localStorage implementation has been superseded by supabase-store.tsx.
 */
export { useStore } from '@/lib/supabase-store';
