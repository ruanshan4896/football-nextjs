import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Admin client dùng secret key - CHỈ dùng server-side (Route Handlers, Server Actions)
// KHÔNG BAO GIỜ expose ra client
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
