'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

const SUBJEK = {
  'matematik':       { label: 'Matematik',       emoji: '🔢', badge: 'bg-violet-100 text-violet-700' },
  'bahasa-melayu':   { label: 'Bahasa Melayu',   emoji: '✍️', badge: 'bg-emerald-100 text-emerald-700' },
  'bahasa-inggeris': { label: 'Bahasa Inggeris',  emoji: '🔤', badge: 'bg-sky-100 text-sky-700' },
  'sains':           { label: 'Sains',            emoji: '🔬', badge: 'bg-amber-100 text-amber-700' },
}

function fmt(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function StatCard({ emoji, label, value, sub, color = 'text-slate-800' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pengguna')
  const [data, setData] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null) // { id, email, name }
  const [deleting, setDeleting] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      if (user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/data', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (!res.ok) { router.push('/dashboard'); return }
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    init()
  }, [router])

  async function handleDelete() {
    if (!deleteModal) return
    setDeleting(true)
    setDeleteMsg(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId: deleteModal.id }),
    })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) {
      setDeleteMsg(json.error)
    } else {
      setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== deleteModal.id), stats: { ...prev.stats, total_users: prev.stats.total_users - 1 } }))
      setDeleteModal(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Memuatkan data admin...</p>
      </div>
    </div>
  )

  const { stats, users, recentSessions, qBySubject } = data

  const TABS = [
    { id: 'pengguna', label: 'Pengguna', icon: '👥', count: stats.total_users },
    { id: 'sesi',     label: 'Sesi',     icon: '📚', count: stats.total_sessions },
    { id: 'soalan',   label: 'Soalan AI', icon: '🤖', count: stats.total_questions },
  ]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 px-5 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8">
        <div className="flex items-center justify-between mb-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider">
              ADMIN
            </span>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white text-xs border border-white/20
                       px-3 py-1.5 rounded-lg transition-colors">
            ← Dashboard
          </button>
        </div>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white text-xl md:text-2xl font-black">Panel Admin</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Semua data pengguna dan aktiviti StudyLa.</p>
        </div>
      </div>

      <div className="px-4 md:px-10 py-5 max-w-5xl mx-auto pb-10">

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard emoji="👥" label="Pengguna" value={stats.total_users} />
          <StatCard emoji="👦" label="Profil Anak" value={stats.total_children} />
          <StatCard emoji="📚" label="Sesi Selesai" value={stats.total_sessions} />
          <StatCard emoji="🤖" label="Soalan AI" value={stats.total_questions}
            sub={`${stats.accuracy}% accuracy`} color="text-violet-700" />
        </div>

        {/* Soalan by subject mini cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {Object.entries(SUBJEK).map(([key, info]) => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2 shadow-sm">
              <span className="text-lg">{info.emoji}</span>
              <div>
                <p className="text-xs text-slate-400 font-medium leading-none">{info.label}</p>
                <p className="text-base font-black text-slate-800">{qBySubject[key] || 0} soalan</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-slate-100">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold transition-colors
                  ${tab === t.id
                    ? 'text-violet-700 border-b-2 border-violet-600 bg-violet-50/50'
                    : 'text-slate-400 hover:text-slate-600'}`}>
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${tab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Tab: Pengguna ── */}
          {tab === 'pengguna' && (
            <div className="divide-y divide-slate-100">
              {users.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">Tiada pengguna.</div>
              )}
              {users.map(u => {
                const isExpanded = expandedUser === u.id
                const isAdmin = u.email === ADMIN_EMAIL
                return (
                  <div key={u.id}>
                    <div
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedUser(isExpanded ? null : u.id)}>

                      {/* Avatar */}
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl
                                      flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(u.name !== '-' ? u.name : u.email).charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 truncate">{u.name !== '-' ? u.name : u.email}</p>
                          {isAdmin && (
                            <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">ADMIN</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-slate-400">{u.child_count} anak · {u.session_count} sesi</span>
                          <span className="text-[11px] text-slate-300">Daftar {fmt(u.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <svg className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                        {!isAdmin && (
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteModal(u); setDeleteMsg(null) }}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded: children list */}
                    {isExpanded && u.children.length > 0 && (
                      <div className="bg-slate-50 px-4 pb-3 pt-1 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 mb-2">Profil Anak:</p>
                        <div className="flex flex-wrap gap-2">
                          {u.children.map(child => (
                            <div key={child.id} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                              <div className="w-5 h-5 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 text-[10px] font-bold">
                                {child.name.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold text-slate-700">{child.name}</span>
                              <span className="text-[10px] text-slate-400">Thn {child.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {isExpanded && u.children.length === 0 && (
                      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400">Tiada profil anak lagi.</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Tab: Sesi ── */}
          {tab === 'sesi' && (
            <div className="divide-y divide-slate-100">
              {recentSessions.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">Tiada sesi lagi.</div>
              )}
              {recentSessions.map(s => {
                const subj = SUBJEK[s.subject]
                const acc = s.total_questions > 0
                  ? Math.round((s.correct_count / s.total_questions) * 100) : 0
                const accColor = acc >= 80 ? 'text-emerald-600' : acc >= 50 ? 'text-amber-600' : 'text-red-500'
                return (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                      {subj?.emoji || '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{s.child_name}
                        <span className="text-slate-300 font-normal"> · Thn {s.child_year}</span>
                      </p>
                      <p className="text-xs text-slate-400 truncate">{subj?.label || s.subject} · {fmtTime(s.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-black ${accColor}`}>{acc}%</p>
                      <p className="text-[11px] text-slate-400">{s.correct_count}/{s.total_questions}</p>
                    </div>
                  </div>
                )
              })}
              {recentSessions.length >= 50 && (
                <div className="px-4 py-3 text-center text-xs text-slate-400">
                  Menunjukkan 50 sesi terkini sahaja.
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Soalan AI ── */}
          {tab === 'soalan' && (
            <div>
              {/* Summary by subject */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-slate-100">
                {Object.entries(SUBJEK).map(([key, info]) => (
                  <div key={key} className={`rounded-xl p-3 ${info.badge.split(' ')[0].replace('text', 'bg').replace('700', '50')} border border-slate-200`}>
                    <p className="text-lg">{info.emoji}</p>
                    <p className="text-xl font-black text-slate-800">{qBySubject[key] || 0}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{info.label}</p>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-slate-100">
                {data.questions.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">Tiada soalan dijanakan lagi.</div>
                )}
                {data.questions.map(q => {
                  const subj = SUBJEK[q.subject]
                  return (
                    <div key={q.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                      <span className="text-base w-6 text-center flex-shrink-0">{subj?.emoji || '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subj?.badge || 'bg-slate-100 text-slate-500'}`}>
                            {subj?.label || q.subject}
                          </span>
                          <span className="text-[10px] text-slate-400">Tahun {q.year}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(q.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
                {data.questions.length >= 100 && (
                  <div className="px-4 py-3 text-center text-xs text-slate-400">
                    Menunjukkan 100 soalan terkini sahaja.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal padam user */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h2 className="text-lg font-bold text-slate-800">Padam Pengguna?</h2>
              <p className="text-sm text-slate-500 mt-2">
                Akaun <strong>{deleteModal.email}</strong> dan semua data anak akan dipadam kekal.
              </p>
              {deleteMsg && (
                <p className="text-xs text-red-500 mt-2 bg-red-50 px-3 py-2 rounded-xl">{deleteMsg}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(null); setDeleteMsg(null) }} disabled={deleting}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-2xl text-sm
                           hover:bg-slate-200 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl text-sm
                           active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memadamkan...
                  </>
                ) : 'Ya, Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
