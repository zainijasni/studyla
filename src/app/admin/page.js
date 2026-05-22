'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

const SUBJEK = {
  'matematik':       { label: 'Matematik',       emoji: '🔢', color: 'violet', topics: ['nombor-bulat','tambah-tolak','darab-bahagi','wang','masa-waktu','ukuran','pecahan','perpuluhan','peratus','luas-perimeter','data-graf','nisbah'] },
  'bahasa-melayu':   { label: 'Bahasa Melayu',   emoji: '✍️', color: 'emerald', topics: ['ejaan-bm','tatabahasa-asas','tatabahasa-lanjut','pemahaman','karangan','simpulan-bahasa','karangan-fakta','ayat-majmuk'] },
  'bahasa-inggeris': { label: 'Bahasa Inggeris', emoji: '🔤', color: 'sky', topics: ['vocabulary','phonics-spelling','grammar-basic','grammar-tenses','reading-comprehension','writing','grammar-advanced','letter-writing'] },
  'sains':           { label: 'Sains',           emoji: '🔬', color: 'amber', topics: ['deria','haiwan','tumbuhan','cuaca','jirim','manusia-badan','cahaya-bunyi','daya-gerak','ekosistem','bumi-sumber'] },
}

const TOPIK_LABEL = {
  'nombor-bulat':'Nombor Bulat','tambah-tolak':'Tambah & Tolak','darab-bahagi':'Darab & Bahagi','wang':'Wang','masa-waktu':'Masa & Waktu','ukuran':'Ukuran','pecahan':'Pecahan','perpuluhan':'Perpuluhan','peratus':'Peratus','luas-perimeter':'Luas & Perimeter','data-graf':'Data & Graf','nisbah':'Nisbah',
  'ejaan-bm':'Ejaan & Sebutan','tatabahasa-asas':'Tatabahasa Asas','tatabahasa-lanjut':'Tatabahasa Lanjut','pemahaman':'Pemahaman','karangan':'Karangan Bergambar','simpulan-bahasa':'Simpulan Bahasa','karangan-fakta':'Karangan Fakta','ayat-majmuk':'Ayat Majmuk',
  'vocabulary':'Vocabulary','phonics-spelling':'Phonics & Spelling','grammar-basic':'Grammar Basics','grammar-tenses':'Grammar Tenses','reading-comprehension':'Reading Comprehension','writing':'Guided Writing','grammar-advanced':'Grammar Advanced','letter-writing':'Letter Writing',
  'deria':'Deria & Fungsi','haiwan':'Haiwan','tumbuhan':'Tumbuhan','cuaca':'Cuaca','jirim':'Jirim','manusia-badan':'Sistem Badan','cahaya-bunyi':'Cahaya & Bunyi','daya-gerak':'Daya & Gerakan','ekosistem':'Ekosistem','bumi-sumber':'Bumi & Sumber',
}

// Popular topics to pre-seed — target 20+ questions each
const SEED_PLAN = [
  { subject: 'matematik',      topic: 'nombor-bulat',    year: 3 },
  { subject: 'matematik',      topic: 'tambah-tolak',    year: 3 },
  { subject: 'matematik',      topic: 'darab-bahagi',    year: 3 },
  { subject: 'matematik',      topic: 'wang',            year: 3 },
  { subject: 'matematik',      topic: 'masa-waktu',      year: 3 },
  { subject: 'matematik',      topic: 'nombor-bulat',    year: 4 },
  { subject: 'matematik',      topic: 'tambah-tolak',    year: 4 },
  { subject: 'matematik',      topic: 'darab-bahagi',    year: 4 },
  { subject: 'matematik',      topic: 'wang',            year: 4 },
  { subject: 'matematik',      topic: 'pecahan',         year: 4 },
  { subject: 'bahasa-melayu',  topic: 'ejaan-bm',        year: 3 },
  { subject: 'bahasa-melayu',  topic: 'tatabahasa-asas', year: 3 },
  { subject: 'bahasa-melayu',  topic: 'pemahaman',       year: 3 },
  { subject: 'bahasa-melayu',  topic: 'ejaan-bm',        year: 4 },
  { subject: 'bahasa-melayu',  topic: 'tatabahasa-asas', year: 4 },
  { subject: 'bahasa-melayu',  topic: 'tatabahasa-lanjut', year: 4 },
  { subject: 'bahasa-melayu',  topic: 'pemahaman',       year: 4 },
]

const COLOR = {
  violet: { badge: 'bg-violet-100 text-violet-700', btn: 'bg-violet-700 hover:bg-violet-800', ring: 'ring-violet-400', light: 'bg-violet-50 border-violet-200' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-700 hover:bg-emerald-800', ring: 'ring-emerald-400', light: 'bg-emerald-50 border-emerald-200' },
  sky: { badge: 'bg-sky-100 text-sky-700', btn: 'bg-sky-700 hover:bg-sky-800', ring: 'ring-sky-400', light: 'bg-sky-50 border-sky-200' },
  amber: { badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-700 hover:bg-amber-800', ring: 'ring-amber-400', light: 'bg-amber-50 border-amber-200' },
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
  const [loadError, setLoadError] = useState(null)
  const [tab, setTab] = useState('pengguna')
  const [data, setData] = useState(null)

  // Users
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)

  // Questions browser
  const [filterSubjek, setFilterSubjek] = useState('matematik')
  const [filterTopik, setFilterTopik] = useState(null)
  const [filterYear, setFilterYear] = useState(null)
  const [expandedQ, setExpandedQ] = useState(null)

  // Bulk generate
  const [genSubjek, setGenSubjek] = useState('matematik')
  const [genTopik, setGenTopik] = useState('')
  const [genYear, setGenYear] = useState(3)
  const [genBatches, setGenBatches] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState(null)

  // Seed popular
  const [seedRunning, setSeedRunning] = useState(false)
  const [seedDone, setSeedDone]       = useState(0)
  const [seedTotal, setSeedTotal]     = useState(0)
  const [seedCurrent, setSeedCurrent] = useState(null)
  const [seedLog, setSeedLog]         = useState([])

  useEffect(() => {
    async function init() {
      const { data: { session: initSession } } = await supabase.auth.getSession()
      const user = initSession?.user
      if (!user) { router.push('/login'); return }
      if (user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return }
      await loadData()
    }
    init()
  }, [router])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoadError('Sesi tamat. Sila log masuk semula.')
        setLoading(false)
        return
      }
      const res = await fetch('/api/admin/data', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      const json = await res.json()
      if (!res.ok) {
        setLoadError(`API Error ${res.status}: ${json.error || 'Unknown'} — ${json.detail || ''}`)
        setLoading(false)
        return
      }
      setData(json)
      setLoading(false)
    } catch (err) {
      setLoadError(`Ralat: ${err.message}`)
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteModal) return
    setDeleting(true); setDeleteMsg(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId: deleteModal.id }),
    })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { setDeleteMsg(json.error) }
    else {
      setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== deleteModal.id), stats: { ...prev.stats, total_users: prev.stats.total_users - 1 } }))
      setDeleteModal(null)
    }
  }

  async function handleSeedAll() {
    const MIN_STOCK = 20
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    // Only seed topics below MIN_STOCK
    const toSeed = SEED_PLAN.filter(item => {
      const key = `${item.subject}|${item.topic}|${item.year}`
      return (data?.stockMap?.[key] || 0) < MIN_STOCK
    })

    if (toSeed.length === 0) { alert('Semua topik popular dah cukup stok (≥20)! 🎉'); return }

    setSeedRunning(true)
    setSeedDone(0)
    setSeedTotal(toSeed.length)
    setSeedLog([])
    setSeedCurrent(null)

    const token = session.access_token
    const log = []

    for (let i = 0; i < toSeed.length; i++) {
      const item = toSeed[i]
      setSeedCurrent(item)
      try {
        const res = await fetch('/api/admin/bulk-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subject: item.subject, topic: item.topic, year: item.year, batches: 5 }),
        })
        const json = await res.json()
        log.push({ ...item, generated: json.generated || 0, ok: true })
      } catch {
        log.push({ ...item, generated: 0, ok: false })
      }
      setSeedDone(i + 1)
      setSeedLog([...log])
    }

    setSeedCurrent(null)
    setSeedRunning(false)
    await loadData()
  }

  async function handleBulkGenerate() {
    if (!genTopik) return
    setGenerating(true); setGenResult(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/bulk-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ subject: genSubjek, topic: genTopik, year: genYear, batches: genBatches }),
    })
    const json = await res.json()
    setGenerating(false)
    setGenResult(json)
    // Reload data to update stock
    await loadData()
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Memuatkan data admin...</p>
      </div>
    </div>
  )

  if (loadError) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="font-bold text-slate-800 mb-2">Gagal Muatkan Admin</h2>
        <p className="text-xs text-red-600 bg-red-50 rounded-xl p-3 mb-4 text-left font-mono break-all">{loadError}</p>
        <div className="flex gap-2">
          <button onClick={() => { setLoading(true); setLoadError(null); loadData() }}
            className="flex-1 bg-violet-700 text-white font-bold py-2.5 rounded-xl text-sm">
            Cuba Semula
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="flex-1 bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl text-sm">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )

  const { stats, users, recentSessions, questions, qBySubject, stockMap } = data

  // Filter questions for browser
  const filteredQ = questions.filter(q => {
    if (q.subject !== filterSubjek) return false
    if (filterTopik && q.topic !== filterTopik) return false
    if (filterYear && q.year !== filterYear) return false
    return true
  })

  const TABS = [
    { id: 'pengguna', label: 'Pengguna', icon: '👥', count: stats.total_users },
    { id: 'sesi',     label: 'Sesi',     icon: '📚', count: stats.total_sessions },
    { id: 'soalan',   label: 'Soalan',   icon: '📋', count: stats.total_questions },
    { id: 'jana',     label: 'Jana AI',  icon: '🤖', count: null },
  ]

  const currentSubjTopics = SUBJEK[filterSubjek]?.topics || []
  const genSubjTopics = SUBJEK[genSubjek]?.topics || []

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 px-5 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8">
        <div className="flex items-center justify-between mb-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider">ADMIN</span>
          </div>
          <button onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg transition-colors">
            ← Dashboard
          </button>
        </div>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white text-xl md:text-2xl font-black">Panel Admin</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">Pengurusan pengguna, soalan & jana soalan AI.</p>
        </div>
      </div>

      <div className="px-4 md:px-10 py-5 max-w-5xl mx-auto pb-12">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard emoji="👥" label="Pengguna" value={stats.total_users} />
          <StatCard emoji="👦" label="Profil Anak" value={stats.total_children} />
          <StatCard emoji="📚" label="Sesi Selesai" value={stats.total_sessions} />
          <StatCard emoji="📋" label="Stok Soalan" value={stats.total_questions} sub={`${stats.accuracy}% avg accuracy`} color="text-violet-700" />
        </div>

        {/* Tab panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-bold transition-colors
                  ${tab === t.id ? 'text-violet-700 border-b-2 border-violet-600 bg-violet-50/50' : 'text-slate-400 hover:text-slate-600'}`}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${tab === t.id ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB: PENGGUNA ── */}
          {tab === 'pengguna' && (
            <div className="divide-y divide-slate-100">
              {users.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">Tiada pengguna.</div>}
              {users.map(u => {
                const isExpanded = expandedUser === u.id
                const isAdmin = u.email === ADMIN_EMAIL
                return (
                  <div key={u.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(u.name !== '-' ? u.name : u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 truncate">{u.name !== '-' ? u.name : u.email}</p>
                          {isAdmin && <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">ADMIN</span>}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        <p className="text-[11px] text-slate-400">{u.child_count} anak · {u.session_count} sesi · Daftar {fmt(u.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <svg className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        {!isAdmin && (
                          <button onClick={e => { e.stopPropagation(); setDeleteModal(u); setDeleteMsg(null) }}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 space-y-3">
                        {/* Contact details */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <p className="text-[10px] text-slate-400 font-semibold mb-0.5">📱 No. Telefon</p>
                            <p className="text-xs font-bold text-slate-700">{u.phone !== '-' ? u.phone : <span className="text-slate-400 font-normal italic">Tiada</span>}</p>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <p className="text-[10px] text-slate-400 font-semibold mb-0.5">🕐 Login Terakhir</p>
                            <p className="text-xs font-bold text-slate-700">{fmt(u.last_sign_in)}</p>
                          </div>
                        </div>
                        {/* Children */}
                        {u.children.length === 0
                          ? <p className="text-xs text-slate-400">Tiada profil anak lagi.</p>
                          : (
                            <div>
                              <p className="text-[10px] text-slate-400 font-semibold mb-1.5">👦 Profil Anak</p>
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
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── TAB: SESI ── */}
          {tab === 'sesi' && (
            <div className="divide-y divide-slate-100">
              {recentSessions.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">Tiada sesi lagi.</div>}
              {recentSessions.map(s => {
                const subj = SUBJEK[s.subject]
                const acc = s.total_questions > 0 ? Math.round((s.correct_count / s.total_questions) * 100) : 0
                const accColor = acc >= 80 ? 'text-emerald-600' : acc >= 50 ? 'text-amber-600' : 'text-red-500'
                return (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0">{subj?.emoji || '📚'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {s.child_name} <span className="text-slate-300 font-normal">· Thn {s.child_year}</span>
                      </p>
                      <p className="text-xs text-slate-400 truncate">{subj?.label || s.subject} · {TOPIK_LABEL[s.topic] || s.topic} · {fmtTime(s.created_at)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-black ${accColor}`}>{acc}%</p>
                      <p className="text-[11px] text-slate-400">{s.correct_count}/{s.total_questions}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── TAB: SOALAN ── */}
          {tab === 'soalan' && (
            <div>
              {/* Filter bar */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                {/* Subject filter */}
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(SUBJEK).map(([key, s]) => (
                    <button key={key} onClick={() => { setFilterSubjek(key); setFilterTopik(null) }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors
                        ${filterSubjek === key ? `bg-${s.color}-600 text-white` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
                {/* Topic + Year filter */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setFilterTopik(null)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors
                      ${!filterTopik ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    Semua Topik
                  </button>
                  {currentSubjTopics.map(t => (
                    <button key={t} onClick={() => setFilterTopik(t)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors
                        ${filterTopik === t ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {TOPIK_LABEL[t]}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-400 font-medium">Tahun:</span>
                  <button onClick={() => setFilterYear(null)} className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${!filterYear ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>Semua</button>
                  {[1,2,3,4,5].map(y => (
                    <button key={y} onClick={() => setFilterYear(y)} className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${filterYear === y ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{y}</button>
                  ))}
                  <span className="text-xs text-slate-400 ml-auto">{filteredQ.length} soalan</span>
                </div>
              </div>

              {/* Questions list */}
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {filteredQ.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 text-sm mb-1">Tiada soalan untuk filter ini.</p>
                    <p className="text-slate-300 text-xs">Pergi tab Jana AI untuk generate soalan baru.</p>
                  </div>
                )}
                {filteredQ.map((q, i) => {
                  const isOpen = expandedQ === q.id
                  const subj = SUBJEK[q.subject]
                  const c = COLOR[subj?.color || 'violet']
                  return (
                    <div key={q.id}>
                      <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setExpandedQ(isOpen ? null : q.id)}>
                        <span className="text-slate-400 text-xs font-mono mt-0.5 w-6 flex-shrink-0">{i+1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 leading-snug">{q.question_text}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{TOPIK_LABEL[q.topic] || q.topic}</span>
                            <span className="text-[10px] text-slate-400">Thn {q.year}</span>
                            <span className="text-[10px] text-slate-300">{fmt(q.created_at)}</span>
                          </div>
                        </div>
                        <svg className={`text-slate-300 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>

                      {isOpen && (
                        <div className={`mx-4 mb-3 rounded-2xl border p-4 space-y-3 text-xs ${c.light}`}>
                          {/* Layer 1 */}
                          <div>
                            <p className="font-black text-slate-600 mb-1.5">🧠 Layer 1 — Faham Soalan</p>
                            {(q.question_breakdown || []).map((s, i) => (
                              <p key={i} className="text-slate-600 mb-0.5">→ {s}</p>
                            ))}
                            {q.parent_script && <p className="text-slate-400 italic mt-1">"{q.parent_script}"</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TAB: JANA AI ── */}
          {tab === 'jana' && (
            <div className="p-5 space-y-5">

              {/* ── Seed Popular Topics ── */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-violet-800">🌱 Seed Topik Popular</p>
                    <p className="text-xs text-violet-500 mt-0.5">Jana soalan untuk topik paling kerap digunakan. Topik dengan &lt;20 soalan akan di-seed (5 batch = ~15 soalan).</p>
                  </div>
                  <button
                    onClick={handleSeedAll}
                    disabled={seedRunning || generating}
                    className="flex-shrink-0 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all">
                    {seedRunning ? 'Running...' : 'Seed Semua'}
                  </button>
                </div>

                {/* Progress */}
                {(seedRunning || seedLog.length > 0) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-violet-600 font-semibold">
                        {seedRunning ? `${seedDone}/${seedTotal} topik selesai` : `✅ Selesai — ${seedDone} topik di-seed`}
                      </span>
                      <span className="text-violet-400">{seedTotal > 0 ? Math.round((seedDone/seedTotal)*100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${seedTotal > 0 ? (seedDone/seedTotal)*100 : 0}%` }} />
                    </div>
                    {seedCurrent && (
                      <p className="text-[10px] text-violet-500 animate-pulse">
                        ⏳ Jana: {TOPIK_LABEL[seedCurrent.topic]} · {SUBJEK[seedCurrent.subject]?.label} Thn {seedCurrent.year}
                      </p>
                    )}
                  </div>
                )}

                {/* Log */}
                {seedLog.length > 0 && !seedRunning && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {seedLog.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-600">{TOPIK_LABEL[item.topic]} · Thn {item.year}</span>
                        <span className={item.ok ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                          {item.ok ? `+${item.generated} soalan` : 'gagal'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock grid */}
                {!seedRunning && seedLog.length === 0 && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {SEED_PLAN.map((item, i) => {
                      const stock = data?.stockMap?.[`${item.subject}|${item.topic}|${item.year}`] || 0
                      return (
                        <div key={i} className="bg-white rounded-lg px-2.5 py-1.5 flex items-center justify-between border border-violet-100">
                          <span className="text-[10px] text-slate-600 truncate">{TOPIK_LABEL[item.topic]} T{item.year}</span>
                          <span className={`text-[10px] font-black flex-shrink-0 ml-1 ${stock >= 20 ? 'text-emerald-600' : stock >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                            {stock}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-700 mb-1">Jana Manual Per Topik</p>
                <p className="text-xs text-slate-400">Pilih topik spesifik untuk di-generate secara manual.</p>
              </div>

              {/* Subjek */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">Subjek</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(SUBJEK).map(([key, s]) => (
                    <button key={key} onClick={() => { setGenSubjek(key); setGenTopik('') }}
                      className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors
                        ${genSubjek === key
                          ? `bg-${s.color}-700 text-white`
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topik */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block">Topik</label>
                <div className="flex gap-2 flex-wrap">
                  {genSubjTopics.map(t => {
                    const stockKey = `${genSubjek}|${t}|${genYear}`
                    const stock = stockMap?.[stockKey] || 0
                    return (
                      <button key={t} onClick={() => setGenTopik(t)}
                        className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5
                          ${genTopik === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {TOPIK_LABEL[t]}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black
                          ${stock >= 20 ? 'bg-emerald-100 text-emerald-600' : stock >= 5 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-500'}`}>
                          {stock}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tahun + Batch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block">Tahun</label>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(y => (
                      <button key={y} onClick={() => setGenYear(y)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors
                          ${genYear === y ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block">Bilangan Batch (×3 soalan)</label>
                  <div className="flex gap-1.5">
                    {[3,5,10,15].map(b => (
                      <button key={b} onClick={() => setGenBatches(b)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors
                          ${genBatches === b ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">≈ {genBatches * 3} soalan akan dijanakan</p>
                </div>
              </div>

              {/* Stock for selected */}
              {genTopik && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-600">{TOPIK_LABEL[genTopik]} · Tahun {genYear}</p>
                    <p className="text-xs text-slate-400">Stok semasa dalam DB</p>
                  </div>
                  {(() => {
                    const stock = stockMap?.[`${genSubjek}|${genTopik}|${genYear}`] || 0
                    return (
                      <div className={`text-lg font-black ${stock >= 20 ? 'text-emerald-600' : stock >= 5 ? 'text-amber-600' : 'text-red-500'}`}>
                        {stock} soalan
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Result */}
              {genResult && (
                <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${genResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  ✅ {genResult.message}
                  {genResult.errors && genResult.errors.length > 0 && (
                    <p className="text-xs mt-1 opacity-70">{genResult.errors.length} batch ada error kecil.</p>
                  )}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleBulkGenerate}
                disabled={generating || !genTopik}
                className="w-full bg-gradient-to-r from-violet-800 to-indigo-800 hover:from-violet-900 hover:to-indigo-900
                           text-white font-bold rounded-xl py-4 text-sm active:scale-95 transition-all
                           disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Jana {genBatches} batch... ({genBatches * 3} soalan)
                  </>
                ) : (
                  `🤖 Jana ${genBatches} Batch — ~${genBatches * 3} Soalan`
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Soalan disimpan dalam DB. User akan dapat soalan dari pool ini, AI hanya dipanggil bila pool kosong.
              </p>
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
              <p className="text-sm text-slate-500 mt-2">Akaun <strong>{deleteModal.email}</strong> dan semua data anak akan dipadam kekal.</p>
              {deleteMsg && <p className="text-xs text-red-500 mt-2 bg-red-50 px-3 py-2 rounded-xl">{deleteMsg}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(null); setDeleteMsg(null) }} disabled={deleting}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-2xl text-sm hover:bg-slate-200 transition-colors disabled:opacity-50">
                Batal
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memadamkan...</> : 'Ya, Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
