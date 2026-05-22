import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

export async function POST(request) {
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authErr || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

  // Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json({ error: 'Tidak boleh padam akaun sendiri' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Padam data dalam DB dulu (children, sessions, progress — via RLS cascade or manual)
  const { data: kids } = await admin.from('children').select('id').eq('user_id', userId)
  if (kids && kids.length > 0) {
    const kidIds = kids.map(k => k.id)
    await admin.from('topic_progress').delete().in('child_id', kidIds)
    await admin.from('sessions').delete().in('child_id', kidIds)
    await admin.from('children').delete().eq('user_id', userId)
  }

  // Padam auth user
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
