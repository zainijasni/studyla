import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

export async function GET(request) {
  // Auth check — guna anon client utk verify caller
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

  // Guna service role untuk bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Ambil semua data serentak
  const [
    { data: { users: authUsers } },
    { data: children },
    { data: sessions },
    { data: questions },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('children').select('id, name, year, user_id, created_at').order('created_at', { ascending: false }),
    admin.from('sessions').select('id, child_id, subject, topic, correct_count, total_questions, created_at, completed').eq('completed', true).order('created_at', { ascending: false }).limit(100),
    admin.from('questions').select('id, subject, topic, year, created_at').order('created_at', { ascending: false }).limit(500),
  ])

  // Map children & sessions ke user
  const childrenByUser = (children || []).reduce((acc, c) => {
    if (!acc[c.user_id]) acc[c.user_id] = []
    acc[c.user_id].push(c)
    return acc
  }, {})

  const childIds = (children || []).map(c => c.id)
  const sessionsByChild = (sessions || []).reduce((acc, s) => {
    if (!acc[s.child_id]) acc[s.child_id] = []
    acc[s.child_id].push(s)
    return acc
  }, {})

  // Build user list
  const users = (authUsers || []).map(u => {
    const kids = childrenByUser[u.id] || []
    const kidSessions = kids.flatMap(k => sessionsByChild[k.id] || [])
    return {
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || '-',
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      child_count: kids.length,
      session_count: kidSessions.length,
      children: kids,
    }
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Stats
  const totalQ = (sessions || []).reduce((a, s) => a + (s.total_questions || 0), 0)
  const totalBetul = (sessions || []).reduce((a, s) => a + (s.correct_count || 0), 0)

  // Soalan count per subject
  const qBySubject = (questions || []).reduce((acc, q) => {
    acc[q.subject] = (acc[q.subject] || 0) + 1
    return acc
  }, {})

  // Recent sessions enriched dengan child name
  const childMap = (children || []).reduce((acc, c) => { acc[c.id] = c; return acc }, {})
  const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc }, {})
  const recentSessions = (sessions || []).slice(0, 50).map(s => {
    const child = childMap[s.child_id]
    const parentUser = child ? userMap[child.user_id] : null
    return {
      ...s,
      child_name: child?.name || '-',
      child_year: child?.year || '-',
      parent_email: parentUser?.email || '-',
    }
  })

  return NextResponse.json({
    stats: {
      total_users: users.length,
      total_children: (children || []).length,
      total_sessions: (sessions || []).length,
      total_questions: (questions || []).length,
      accuracy: totalQ > 0 ? Math.round((totalBetul / totalQ) * 100) : 0,
    },
    users,
    recentSessions,
    questions: (questions || []).slice(0, 100),
    qBySubject,
  })
}
