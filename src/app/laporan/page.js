'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJEK_INFO = {
  matematik:         { label: 'Matematik',      emoji: '🔢', grad: 'from-violet-500 to-indigo-600', badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500' },
  'bahasa-melayu':   { label: 'Bahasa Melayu',  emoji: '✍️', grad: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
  'bahasa-inggeris': { label: 'Bahasa Inggeris',emoji: '🔤', grad: 'from-sky-500 to-blue-600',     badge: 'bg-sky-100 text-sky-700',        bar: 'bg-sky-500' },
  sains:             { label: 'Sains',           emoji: '🔬', grad: 'from-amber-500 to-orange-500', badge: 'bg-amber-100 text-amber-700',    bar: 'bg-amber-500' },
}

const TOPIK_LABEL = {
  'nombor-bulat':'Nombor Bulat & Nilai Tempat','tambah-tolak':'Tambah dan Tolak','darab-bahagi':'Darab dan Bahagi','wang':'Wang & Kewangan','masa-waktu':'Masa dan Waktu','ukuran':'Panjang, Jisim & Isipadu','pecahan':'Pecahan','perpuluhan':'Perpuluhan','peratus':'Peratus','luas-perimeter':'Luas dan Perimeter','data-graf':'Data dan Graf','nisbah':'Nisbah dan Kadaran',
  'ejaan-bm':'Ejaan & Sebutan','tatabahasa-asas':'Tatabahasa Asas','tatabahasa-lanjut':'Kata Adjektif & Kata Hubung','pemahaman':'Pemahaman & Inferens','karangan':'Karangan Bergambar','simpulan-bahasa':'Simpulan Bahasa & Peribahasa','karangan-fakta':'Karangan Fakta & Imaginatif','ayat-majmuk':'Ayat Majmuk & Penjodoh Bilangan',
  'vocabulary':'Vocabulary','phonics-spelling':'Phonics & Spelling','grammar-basic':'Grammar Basics','grammar-tenses':'Grammar — Tenses','reading-comprehension':'Reading Comprehension','writing':'Guided Writing','grammar-advanced':'Grammar — Sentences','letter-writing':'Letter Writing',
  'deria':'Deria & Fungsinya','haiwan':'Haiwan & Kepelbagaian','tumbuhan':'Tumbuhan & Proses Hidup','cuaca':'Cuaca & Alam Sekitar','jirim':'Jirim & Perubahan','manusia-badan':'Sistem Badan Manusia','cahaya-bunyi':'Cahaya dan Bunyi','daya-gerak':'Daya dan Gerakan','ekosistem':'Ekosistem & Rantai Makanan','bumi-sumber':'Bumi & Sumber Asli',
  'pecahan-t3':'Pecahan','perpuluhan-peratus':'Perpuluhan & Peratus','tatabahasa':'Tatabahasa','grammar':'Grammar',
}

const STATUS_CONFIG = {
  mastered:         { label: 'Dah Faham',    emoji: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', pill: 'bg-emerald-100 text-emerald-700' },
  progressing:      { label: 'Dalam Proses', emoji: '🟡', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   pill: 'bg-amber-100 text-amber-700' },
  struggling:       { label: 'Perlu Bantuan',emoji: '🔴', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     pill: 'bg-red-100 text-red-700' },
  backtrack_needed: { label: 'Semak Balik',  emoji: '🔁', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  pill: 'bg-orange-100 text-orange-700' },
  not_started:      { label: 'Belum Cuba',   emoji: '⚪', bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   pill: 'bg-slate-100 text-slate-500' },
}

const AVATAR_COLORS = ['from-pink-400 to-rose-400','from-violet-400 to-purple-500','from-sky-400 to-blue-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-400']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function calcStreak(sessions) {
  if (!sessions.length) return 0
  const dates = new Set(sessions.map(s => s.created_at.split('T')[0]))
  let streak = 0
  const today = new Date()
  // If today has no session, start checking from yesterday
  const startOffset = dates.has(today.toISOString().split('T')[0]) ? 0 : 1
  for (let i = startOffset; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dates.has(d.toISOString().split('T')[0])) streak++
    else if (i > startOffset) break
  }
  return streak
}

function get7DayData(sessions) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const daySess = sessions.filter(s => s.created_at.startsWith(dateStr))
    const totalQ = daySess.reduce((a, s) => a + (s.total_questions || 0), 0)
    const totalB  = daySess.reduce((a, s) => a + (s.correct_count || 0), 0)
    const label = d.toLocaleDateString('ms-MY', { weekday: 'short' }).slice(0, 3)
    return { dateStr, label, count: daySess.length, accuracy: totalQ > 0 ? Math.round(totalB / totalQ * 100) : 0 }
  })
}

function getSubjectStats(sessions) {
  return Object.entries(SUBJEK_INFO).map(([id, info]) => {
    const s = sessions.filter(x => x.subject === id)
    const totalQ = s.reduce((a, x) => a + (x.total_questions || 0), 0)
    const totalB  = s.reduce((a, x) => a + (x.correct_count || 0), 0)
    return { id, ...info, count: s.length, accuracy: totalQ > 0 ? Math.round(totalB / totalQ * 100) : null }
  }).filter(s => s.count > 0).sort((a, b) => (b.accuracy ?? -1) - (a.accuracy ?? -1))
}

function getRecommendations(progress, sessions, childId) {
  const recs = []
  const struggling  = progress.filter(p => ['struggling','backtrack_needed'].includes(p.status))
  const progressing = progress.filter(p => p.status === 'progressing')
  const mastered    = progress.filter(p => p.status === 'mastered')

  if (struggling.length > 0) {
    const t = struggling[0]
    recs.push({ type: 'urgent', emoji: '🔴', title: 'Perlu Perhatian Segera',
      desc: `${TOPIK_LABEL[t.topic] || t.topic} — ulang semula perlahan-lahan`,
      href: `/pilih-sesi?anak=${childId}&subjek=${t.subject}&topik=${t.topic}`,
      color: 'border-red-200 bg-red-50 text-red-700' })
  }

  const streak = calcStreak(sessions)
  if (streak === 0 && sessions.length === 0) {
    recs.push({ type: 'start', emoji: '🚀', title: 'Mulakan Sesi Pertama',
      desc: 'Pilih topik dan mula belajar bersama anak sekarang!',
      href: `/pilih-sesi?anak=${childId}`,
      color: 'border-violet-200 bg-violet-50 text-violet-700' })
  } else if (streak === 0 && sessions.length > 0) {
    recs.push({ type: 'habit', emoji: '📅', title: 'Teruskan Konsistensi',
      desc: 'Belum buat sesi hari ini. 10 minit sehari buat perbezaan besar!',
      href: `/pilih-sesi?anak=${childId}`,
      color: 'border-amber-200 bg-amber-50 text-amber-700' })
  } else if (streak >= 3) {
    recs.push({ type: 'streak', emoji: '🔥', title: `${streak} Hari Berturut-turut!`,
      desc: 'Hebat! Kekalkan semangat belajar setiap hari.',
      color: 'border-orange-200 bg-orange-50 text-orange-700' })
  }

  if (progressing.length > 0) {
    const t = progressing[0]
    recs.push({ type: 'continue', emoji: '💪', title: 'Hampir Faham!',
      desc: `${TOPIK_LABEL[t.topic] || t.topic} — satu lagi sesi untuk kuasai topik ini`,
      href: `/pilih-sesi?anak=${childId}&subjek=${t.subject}&topik=${t.topic}`,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-700' })
  }

  if (recs.length < 2 && mastered.length > 0) {
    recs.push({ type: 'explore', emoji: '⭐', title: 'Dah Faham! Terokai Lebih',
      desc: `${mastered.length} topik dah dikuasai. Cuba topik baru!`,
      href: `/pilih-sesi?anak=${childId}`,
      color: 'border-sky-200 bg-sky-50 text-sky-700' })
  }

  return recs.slice(0, 3)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, emoji, bg = 'bg-white', valueColor = 'text-slate-800' }) {
  return (
    <div className={`${bg} border border-slate-200 rounded-2xl p-4 text-center shadow-sm`}>
      {emoji && <div className="text-2xl mb-1">{emoji}</div>}
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium leading-tight">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function TopikCard({ topik, status, lastSession }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="text-sm flex-shrink-0">{cfg.emoji}</span>
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${cfg.text} truncate`}>{TOPIK_LABEL[topik] || topik}</p>
          {lastSession && <p className="text-[10px] text-slate-400 mt-0.5">Terakhir: {formatDate(lastSession)}</p>}
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${cfg.pill}`}>{cfg.label}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function LaporanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anakParam = searchParams.get('anak')

  const [loading, setLoading]           = useState(true)
  const [user, setUser]                 = useState(null)
  const [children, setChildren]         = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [progress, setProgress]         = useState([])
  const [sessions, setSessions]         = useState([])
  const [openSubjek, setOpenSubjek]     = useState(null)

  useEffect(() => {
    async function init() {
      // getSession() reads local storage — no network call, instant
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/login'); return }
      setUser(session.user)

      if (anakParam) {
        // Fetch children + child data all in parallel (2 round trips total)
        const [{ data: childrenData }, { data: progressData }, { data: sessionsData }] = await Promise.all([
          supabase.from('children').select('*').order('created_at', { ascending: true }),
          supabase.from('topic_progress').select('*').eq('child_id', anakParam).order('updated_at', { ascending: false }),
          supabase.from('sessions').select('*').eq('child_id', anakParam).eq('completed', true).order('created_at', { ascending: false }).limit(50),
        ])
        if (!childrenData?.length) { router.push('/dashboard'); return }
        setChildren(childrenData)
        setSelectedChild(childrenData.find(c => c.id === anakParam) || childrenData[0])
        setProgress(progressData || [])
        setSessions(sessionsData || [])
      } else {
        // Fetch children first, then child data in parallel
        const { data: childrenData } = await supabase.from('children').select('*').order('created_at', { ascending: true })
        if (!childrenData?.length) { router.push('/dashboard'); return }
        setChildren(childrenData)
        const firstChild = childrenData[0]
        setSelectedChild(firstChild)
        const [{ data: progressData }, { data: sessionsData }] = await Promise.all([
          supabase.from('topic_progress').select('*').eq('child_id', firstChild.id).order('updated_at', { ascending: false }),
          supabase.from('sessions').select('*').eq('child_id', firstChild.id).eq('completed', true).order('created_at', { ascending: false }).limit(50),
        ])
        setProgress(progressData || [])
        setSessions(sessionsData || [])
      }

      setLoading(false)
    }
    init()
  }, [router, anakParam])

  async function loadChildData(childId) {
    setLoading(true)
    const [{ data: progressData }, { data: sessionsData }] = await Promise.all([
      supabase.from('topic_progress').select('*').eq('child_id', childId).order('updated_at', { ascending: false }),
      supabase.from('sessions').select('*').eq('child_id', childId).eq('completed', true)
        .order('created_at', { ascending: false }).limit(50),
    ])
    setProgress(progressData || [])
    setSessions(sessionsData || [])
    setLoading(false)
  }

  // ── Computed ────────────────────────────────────────────────────────────────
  const totalQ    = sessions.reduce((a, s) => a + (s.total_questions || 0), 0)
  const totalB    = sessions.reduce((a, s) => a + (s.correct_count || 0), 0)
  const accuracy  = totalQ > 0 ? Math.round(totalB / totalQ * 100) : 0
  const mastered  = progress.filter(p => p.status === 'mastered').length
  const struggling = progress.filter(p => ['struggling','backtrack_needed'].includes(p.status)).length
  const streak    = calcStreak(sessions)
  const daily7    = get7DayData(sessions)
  const maxDaily  = Math.max(...daily7.map(d => d.count), 1)
  const subjectStats = getSubjectStats(sessions)
  const recommendations = getRecommendations(progress, sessions, selectedChild?.id)
  const progressBySubject = progress.reduce((acc, p) => {
    if (!acc[p.subject]) acc[p.subject] = []
    acc[p.subject].push(p)
    return acc
  }, {})

  if (!selectedChild && loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-pink-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden md:block"><Sidebar user={user} /></div>

      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <button onClick={() => router.push('/dashboard')}
              className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg transition-colors">
              ← Dashboard
            </button>
          </div>
          <h1 className="text-white text-xl md:text-2xl font-bold">Laporan Kemajuan</h1>
          <p className="text-violet-200 text-xs md:text-sm mt-1">Pantau perkembangan belajar anak.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-5 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Child selector */}
          {children.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex gap-2 overflow-x-auto">
              {children.map((child, idx) => {
                const isSelected = selectedChild?.id === child.id
                return (
                  <button key={child.id} onClick={() => { setSelectedChild(child); loadChildData(child.id) }}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all
                      ${isSelected ? 'bg-gradient-to-r from-violet-800 to-indigo-800 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold`}>
                      {child.name.charAt(0)}
                    </div>
                    {child.name.split(' ')[0]}
                  </button>
                )
              })}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <div className="w-8 h-8 border-4 border-pink-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Memuatkan data...</p>
            </div>
          ) : (
            <>
              {/* ── Stats 2×2 ── */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard emoji={streak > 0 ? '🔥' : '📚'} label="Sesi Selesai" value={sessions.length}
                  sub={streak > 0 ? `${streak} hari berturut-turut` : 'Mulakan streak anda!'} />
                <StatCard emoji="🎯" label="Ketepatan"
                  value={accuracy > 0 ? `${accuracy}%` : '—'}
                  valueColor={accuracy >= 70 ? 'text-emerald-600' : accuracy > 0 ? 'text-amber-600' : 'text-slate-400'}
                  bg={accuracy >= 70 ? 'bg-emerald-50' : accuracy > 0 ? 'bg-amber-50' : 'bg-white'} />
                <StatCard emoji="⭐" label="Topik Dikuasai" value={mastered}
                  bg={mastered > 0 ? 'bg-emerald-50' : 'bg-white'}
                  valueColor={mastered > 0 ? 'text-emerald-600' : 'text-slate-400'} />
                <StatCard emoji="🔴" label="Perlu Perhatian" value={struggling}
                  bg={struggling > 0 ? 'bg-red-50' : 'bg-white'}
                  valueColor={struggling > 0 ? 'text-red-600' : 'text-slate-400'} />
              </div>

              {/* ── 7-Day Activity Chart ── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Aktiviti 7 Hari</p>
                <div className="flex items-end gap-1.5 h-20 mb-2">
                  {daily7.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                        {d.count > 0 ? (
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-purple-400 transition-all"
                            style={{ height: `${Math.max((d.count / maxDaily) * 64, 8)}px` }}
                          />
                        ) : (
                          <div className="w-full rounded-t-lg bg-slate-100" style={{ height: '6px' }} />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-400">
                    {daily7.filter(d => d.count > 0).length} hari aktif minggu ini
                  </span>
                  {daily7.some(d => d.count > 0) && (
                    <span className="text-[10px] text-slate-400">
                      avg {Math.round(daily7.filter(d=>d.count>0).reduce((a,d)=>a+d.accuracy,0)/Math.max(daily7.filter(d=>d.count>0).length,1))}% ketepatan
                    </span>
                  )}
                </div>
              </div>

              {/* ── Accuracy Per Subject ── */}
              {subjectStats.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Ketepatan Per Subjek</p>
                  <div className="space-y-3">
                    {subjectStats.map(s => (
                      <div key={s.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{s.emoji}</span>
                            <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                            <span className="text-[10px] text-slate-400">{s.count} sesi</span>
                          </div>
                          <span className={`text-sm font-black ${s.accuracy >= 70 ? 'text-emerald-600' : s.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {s.accuracy !== null ? `${s.accuracy}%` : '—'}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${s.bar}`}
                            style={{ width: `${s.accuracy ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Cadangan ── */}
              {recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cadangan</p>
                  <div className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <div key={i}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border ${rec.color} ${rec.href ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
                        onClick={() => rec.href && router.push(rec.href)}>
                        <span className="text-xl flex-shrink-0">{rec.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold leading-tight">{rec.title}</p>
                          <p className="text-xs opacity-80 mt-0.5 leading-snug">{rec.desc}</p>
                        </div>
                        {rec.href && (
                          <svg className="flex-shrink-0 opacity-50" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Status Per Topik (collapsible per subject) ── */}
              {Object.keys(progressBySubject).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Per Topik</p>
                  <div className="space-y-2">
                    {Object.entries(SUBJEK_INFO).map(([subjekId, info]) => {
                      const topiks = progressBySubject[subjekId]
                      if (!topiks || topiks.length === 0) return null
                      const isOpen = openSubjek === subjekId
                      const masteredCount = topiks.filter(t => t.status === 'mastered').length
                      const strugglingCount = topiks.filter(t => ['struggling','backtrack_needed'].includes(t.status)).length
                      return (
                        <div key={subjekId} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                          <button
                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                            onClick={() => setOpenSubjek(isOpen ? null : subjekId)}>
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${info.grad} flex items-center justify-center text-sm shadow-sm flex-shrink-0`}>
                              {info.emoji}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-700">{info.label}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-emerald-600 font-semibold">⭐ {masteredCount} faham</span>
                                {strugglingCount > 0 && <span className="text-[10px] text-red-500 font-semibold">🔴 {strugglingCount} perlu bantuan</span>}
                                <span className="text-[10px] text-slate-400">{topiks.length} topik</span>
                              </div>
                            </div>
                            <svg className={`text-slate-300 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                              {topiks.map(p => (
                                <TopikCard key={p.id} topik={p.topic} status={p.status} lastSession={p.last_session_at || p.updated_at} />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Sesi Terkini ── */}
              {sessions.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sesi Terkini</p>
                  <div className="space-y-2">
                    {sessions.slice(0, 10).map(sesi => {
                      const info = SUBJEK_INFO[sesi.subject]
                      const pct = sesi.total_questions > 0 ? Math.round((sesi.correct_count / sesi.total_questions) * 100) : 0
                      const pctColor = pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'
                      return (
                        <div key={sesi.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${info?.grad || 'from-slate-400 to-slate-500'} flex items-center justify-center text-base flex-shrink-0 shadow-sm`}>
                            {info?.emoji || '📚'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{TOPIK_LABEL[sesi.topic] || sesi.topic}</p>
                            <p className="text-xs text-slate-400">{formatDate(sesi.created_at)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-black ${pctColor}`}>{pct}%</p>
                            <p className="text-[10px] text-slate-400">{sesi.correct_count}/{sesi.total_questions}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {sessions.length === 0 && progress.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-bold text-slate-700 mb-1">Belum ada sesi</p>
                  <p className="text-sm text-slate-400 mb-5">{selectedChild?.name} belum buat sebarang sesi lagi.</p>
                  <button onClick={() => router.push(`/pilih-sesi?anak=${selectedChild?.id}`)}
                    className="bg-gradient-to-r from-violet-800 to-indigo-800 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md">
                    Mula Sesi Pertama →
                  </button>
                </div>
              )}

              {/* CTA */}
              {sessions.length > 0 && (
                <button onClick={() => router.push(`/pilih-sesi?anak=${selectedChild?.id}`)}
                  className="w-full bg-gradient-to-r from-violet-800 to-indigo-800 hover:from-violet-700 hover:to-indigo-700
                             text-white font-bold rounded-2xl py-4 shadow-md shadow-violet-200 active:scale-95 transition-all">
                  Mula Sesi Belajar →
                </button>
              )}
            </>
          )}
        </div>
        </div>
      </main>

      <BottomNav user={user} active="/laporan" />
    </div>
  )
}

export default function LaporanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <LaporanContent />
    </Suspense>
  )
}
