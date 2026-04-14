import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AdminShell from './AdminShell'

// Server Component - lấy email user để truyền vào AdminShell
// Việc redirect đã được proxy.ts xử lý, layout chỉ render
export default async function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return <AdminShell email={user?.email ?? ''}>{children}</AdminShell>
}
