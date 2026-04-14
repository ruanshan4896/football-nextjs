'use client'
import { createBrowserClient } from '@supabase/ssr'

// Client dùng trong Client Components (login form, etc.)
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
