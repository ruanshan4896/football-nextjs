import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Supabase đổi tên key mới: PUBLISHABLE_KEY thay thế ANON_KEY (tương đương nhau)
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Client dùng cho Server Components / Route Handlers (public key)
export const supabase = createClient(supabaseUrl, supabasePublishableKey)
