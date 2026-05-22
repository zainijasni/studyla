import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

export async function GET(request) {
  try {
    // ── Verify caller ────────────────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    // Guna anon client utk decode token
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(token)

    if (authErr || !user) {
      return NextResponse.json({ error: 'Token tidak sah', detail: authErr?.message }, { status: 401 })
    }

    // Case-insensitive email check
    if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden — bukan admin' }, { status: 403 })
    }

    // ── Admin client (bypass RLS) ─────────────────────────────────────────────
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // ── Fetch semua data — handle each independently ──────────────────────────
    const [listResult, childResult, sessionResult, questionResult] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from('children').select('id, name, year, parent_id, created_at').order('created_at', { ascending: false }),
      admin.from('sessions').select('id, child_id, subject, topic, correct_count, total_questions, created_at, completed').eq('completed', true).order('created_at', { ascending: false }).limit(100),
      admin.from('questions').select('id, subject, topic, year, question_text, question_breakdown, parent_script, created_at').eq('layer', 1).order('created_at', { ascending: false }).limit(300),
    ])

    const authUsers = listResult.data?.users || []
    const children  = childResult.data || []
    const sessions  = sessionResult.data || []
    const questions = questionResult.data || []

    // Log errors but don't fail
    if (listResult.error)    console.error('listUsers error:', listResult.error.message)
    if (childResult.error)   console.error('children error:', childResult.error.message)
    if (sessionResult.error) console.error('sessions error:', sessionResult.error.message)
    if (questionResult.error) console.error('questions error:', questionResult.error.message)

    // ── Stock count per subject+topic+year ────────────────────────────────────
    const { data: allLayer1, error: stockErr } = await admin
      .from('questions')
      .select('subject, topic, year')
      .eq('layer', 1)

    if (stockErr) console.error('stock error:', stockErr.message)

    const stockMap = {}
    ;(allLayer1 || []).forEach(q => {
      const key = `${q.subject}|${q.topic}|${q.year}`
      stockMap[key] = (stockMap[key] || 0) + 1
    })

    // ── Build user list ───────────────────────────────────────────────────────
    const childrenByParent = children.reduce((acc, c) => {
      if (!acc[c.parent_id]) acc[c.parent_id] = []
      acc[c.parent_id].push(c)
      return acc
    }, {})

    const sessionsByChild = sessions.reduce((acc, s) => {
      if (!acc[s.child_id]) acc[s.child_id] = []
      acc[s.child_id].push(s)
      return acc
    }, {})

    const users = authUsers.map(u => {
      const kids = childrenByParent[u.id] || []
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

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalQ = sessions.reduce((a, s) => a + (s.total_questions || 0), 0)
    const totalBetul = sessions.reduce((a, s) => a + (s.correct_count || 0), 0)

    const qBySubject = questions.reduce((acc, q) => {
      acc[q.subject] = (acc[q.subject] || 0) + 1
      return acc
    }, {})

    // ── Recent sessions enriched ──────────────────────────────────────────────
    const childMap = children.reduce((acc, c) => { acc[c.id] = c; return acc }, {})
    const userMap  = users.reduce((acc, u) => { acc[u.id] = u; return acc }, {})

    const recentSessions = sessions.slice(0, 50).map(s => {
      const child = childMap[s.child_id]
      const parentUser = child ? userMap[child.parent_id] : null
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
        total_children: children.length,
        total_sessions: sessions.length,
        total_questions: (allLayer1 || []).length,
        accuracy: totalQ > 0 ? Math.round((totalBetul / totalQ) * 100) : 0,
      },
      users,
      recentSessions,
      questions,
      qBySubject,
      stockMap,
    })

  } catch (err) {
    console.error('Admin data error:', err)
    return NextResponse.json({ error: 'Server error', detail: err.message }, { status: 500 })
  }
}
