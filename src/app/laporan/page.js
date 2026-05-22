'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJEK_INFO = {
  matematik: { label: 'Matematik', emoji: '🔢', grad: 'from-violet-500 to-indigo-600', badge: 'bg-violet-100 text-violet-700' },
  'bahasa-melayu': { label: 'Bahasa Melayu', emoji: '✍️', grad: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-700' },
  'bahasa-inggeris': { label: 'Bahasa Inggeris', emoji: '🔤', grad: 'from-sky-500 to-blue-600', badge: 'bg-sky-100 text-sky-700' },
  sains: { label: 'Sains', emoji: '🔬', grad: 'from-amber-500 to-orange-500', badge: 'bg-amber-100 text-amber-700' },
}

const TOPIK_LABEL = {
  // Matematik
  'nombor-bulat': 'Nombor Bulat & Nilai Tempat',
  'tambah-tolak': 'Tambah dan Tolak',
  'darab-bahagi': 'Darab dan Bahagi',
  'wang': 'Wang & Kewangan',
  'masa-waktu': 'Masa dan Waktu',
  'ukuran': 'Panjang, Jisim & Isipadu',
  'pecahan': 'Pecahan',
  'perpuluhan': 'Perpuluhan',
  'peratus': 'Peratus',
  'luas-perimeter': 'Luas dan Perimeter',
  'data-graf': 'Data dan Graf',
  'nisbah': 'Nisbah dan Kadaran',
  // Bahasa Melayu
  'ejaan-bm': 'Ejaan & Sebutan',
  'tatabahasa-asas': 'Tatabahasa Asas',
  'tatabahasa-lanjut': 'Kata Adjektif & Kata Hubung',
  'pemahaman': 'Pemahaman & Inferens',
  'karangan': 'Karangan Bergambar',
  'simpulan-bahasa': 'Simpulan Bahasa & Peribahasa',
  'karangan-fakta': 'Karangan Fakta & Imaginatif',
  'ayat-majmuk': 'Ayat Majmuk & Penjodoh Bilangan',
  // Bahasa Inggeris
  'vocabulary': 'Vocabulary',
  'phonics-spelling': 'Phonics & Spelling',
  'grammar-basic': 'Grammar Basics',
  'grammar-tenses': 'Grammar — Tenses',
  'reading-comprehension': 'Reading Comprehension',
  'writing': 'Guided Writing',
  'grammar-advanced': 'Grammar — Sentences',
  'letter-writing': 'Letter Writing',
  // Sains
  'deria': 'Deria & Fungsinya',
  'haiwan': 'Haiwan & Kepelbagaian',
  'tumbuhan': 'Tumbuhan & Proses Hidup',
  'cuaca': 'Cuaca & Alam Sekitar',
  'jirim': 'Jirim & Perubahan',
  'manusia-badan': 'Sistem Badan Manusia',
  'cahaya-bunyi': 'Cahaya dan Bunyi',
  'daya-gerak': 'Daya dan Gerakan',
  'ekosistem': 'Ekosistem & Rantai Makanan',
  'bumi-sumber': 'Bumi & Sumber Asli',
  // Legacy
  'pecahan-t3': 'Pecahan',
  'perpuluhan-peratus': 'Perpuluhan & Peratus',
  'tatabahasa': 'Tatabahasa',
  'grammar': 'Grammar',
}

const STATUS_CONFIG = {
  mastered:         { label: 'Dah Faham',    emoji: '🟢', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', pill: 'bg-emerald-100 text-emerald-700' },
  progressing:      { label: 'Dalam Proses', emoji: '🟡', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   pill: 'bg-amber-100 text-amber-700' },
  struggling:       { label: 'Perlu Bantuan',emoji: '🔴', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     pill: 'bg-red-100 text-red-700' },
  backtrack_needed: { label: 'Semak Balik',  emoji: '🔁', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  pill: 'bg-orange-100 text-orange-700' },
  not_started:      { label: 'Belum Cuba',   emoji: '⚪', bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   pill: 'bg-slate-100 text-slate-500' },
}

const AVATAR_COLORS = [
  'from-pink-400 to-rose-400',
  'from-violet-400 to-purple-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-400',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, emoji, bg = 'bg-white' }) {
  return (
    <div className={`${bg} border border-slate-200 rounded-2xl p-4 text-center shadow-sm`}>
      {emoji && <div className="text-2xl mb-1">{emoji}</div>}
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function TopikCard({ topik, status, lastSession }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  const label = TOPIK_LABEL[topik] || topik

  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="text-base flex-shrink-0">{cfg.emoji}</span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${cfg.text} truncate`}>{label}</p>
          {lastSession && (
            <p className="text-xs text-slate-400 mt-0.5">Terakhir: {formatDate(lastSession)}</p>
          )}
        </div>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${cfg.pill}`}>
        {cfg.label}
      </span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function LaporanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anakParam = searchParams.get('anak')

  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [progress, setProgress] = useState([])
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({ total: 0, mastered: 0, struggling: 0, accuracy: 0 })

  useEffect(() => {
    async function loadChildren() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('children').select('*').order('created_at', { ascending: true })
      if (!data || data.length === 0) { router.push('/dashboard'); return }
      setChildren(data)
      const target = anakParam ? data.find(c => c.id === anakParam) : null
      setSelectedChild(target || data[0])
    }
    loadChildren()
  }, [router, anakParam])

  useEffect(() => {
    if (!selectedChild) return
    loadChildData(selectedChild.id)
  }, [selectedChild])

  async function loadChildData(childId) {
    setLoading(true)
    const { data: progressData } = await supabase
      .from('topic_progress').select('*').eq('child_id', childId).order('updated_at', { ascending: false })
    const { data: sessionsData } = await supabase
      .from('sessions').select('*').eq('child_id', childId).eq('completed', true)
      .order('created_at', { ascending: false }).limit(10)

    setProgress(progressData || [])
    setSessions(sessionsData || [])

    const prog = progressData || []
    const sess = sessionsData || []
    const totalQ = sess.reduce((a, s) => a + (s.total_questions || 0), 0)
    const totalBetul = sess.reduce((a, s) => a + (s.correct_count || 0), 0)
    setStats({
      total: sess.length,
      mastered: prog.filter(p => p.status === 'mastered').length,
      struggling: prog.filter(p => p.status === 'struggling' || p.status === 'backtrack_needed').length,
      accuracy: totalQ > 0 ? Math.round((totalBetul / totalQ) * 100) : 0,
    })
    setLoading(false)
  }

  const progressBySubject = progress.reduce((acc, p) => {
    if (!acc[p.subject]) acc[p.subject] = []
    acc[p.subject].push(p)
    return acc
  }, {})

  if (!selectedChild && loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar user={null} />
      </div>

      <main className="flex-1 md:ml-60">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-6 md:px-10 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
          <button onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white text-xs border border-white/20
                       px-3 py-1 rounded-lg transition-colors">
            ← Dashboard
          </button>
        </div>
        <h1 className="text-white text-2xl font-bold">Laporan Kemajuan</h1>
        <p className="text-violet-200 text-sm mt-1">Pantau perkembangan belajar anak.</p>
      </div>

      <div className="px-4 md:px-10 py-6 max-w-3xl">

        {/* Child selector */}
        {children.length > 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 mb-4 flex gap-2 overflow-x-auto">
            {children.map((child, idx) => {
              const isSelected = selectedChild?.id === child.id
              const grad = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all
                    ${isSelected
                      ? 'bg-gradient-to-r from-violet-800 to-indigo-800 text-white shadow-md shadow-violet-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold`}>
                    {child.name.charAt(0)}
                  </div>
                  {child.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        )}

        {/* Child info card */}
        {selectedChild && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${AVATAR_COLORS[children.indexOf(selectedChild) % AVATAR_COLORS.length]}
                            rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm`}>
              {selectedChild.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800">{selectedChild.name}</p>
              <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                Tahun {selectedChild.year}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-pink-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Memuatkan data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard emoji="📚" label="Jumlah Sesi" value={stats.total} />
              <StatCard
                emoji="🎯"
                label="Ketepatan"
                value={`${stats.accuracy}%`}
                bg={stats.accuracy >= 70 ? 'bg-emerald-50' : 'bg-amber-50'}
              />
              <StatCard emoji="⭐" label="Topik Faham" value={stats.mastered} bg="bg-emerald-50" />
              <StatCard
                emoji="🔴"
                label="Perlu Perhatian"
                value={stats.struggling}
                bg={stats.struggling > 0 ? 'bg-red-50' : 'bg-white'}
              />
            </div>

            {/* No sessions */}
            {sessions.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mb-4 shadow-sm">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-bold text-slate-700 mb-1">Belum ada sesi</p>
                <p className="text-sm text-slate-400 mb-5">{selectedChild?.name} belum buat sebarang sesi lagi.</p>
                <button
                  onClick={() => router.push(`/pilih-sesi?anak=${selectedChild?.id}`)}
                  className="bg-gradient-to-r bg-[#BE185D] hover:bg-[#9D174D] text-white text-sm font-bold
                             px-6 py-3 rounded-xl shadow-md shadow-rose-200"
                >
                  Mula Sesi Pertama →
                </button>
              </div>
            )}

            {/* Status per topik */}
            {Object.keys(progressBySubject).length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status Per Topik</h2>
                <div className="space-y-3">
                  {Object.entries(SUBJEK_INFO).map(([subjekId, info]) => {
                    const topiks = progressBySubject[subjekId]
                    if (!topiks || topiks.length === 0) return null
                    return (
                      <div key={subjekId} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${info.grad} flex items-center justify-center text-sm shadow-sm`}>
                            {info.emoji}
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${info.badge}`}>
                            {info.label}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {topiks.map((p) => (
                            <TopikCard key={p.id} topik={p.topic} status={p.status} lastSession={p.last_session_at} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sesi terkini */}
            {sessions.length > 0 && (
              <div className="mb-5">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sesi Terkini</h2>
                <div className="space-y-2">
                  {sessions.map((sesi) => {
                    const info = SUBJEK_INFO[sesi.subject]
                    const peratus = sesi.total_questions > 0
                      ? Math.round((sesi.correct_count / sesi.total_questions) * 100) : 0
                    const peratusColor = peratus >= 80 ? 'text-emerald-500' : peratus >= 50 ? 'text-amber-500' : 'text-red-400'

                    return (
                      <div key={sesi.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info?.grad || 'from-slate-400 to-slate-500'}
                                        flex items-center justify-center text-lg flex-shrink-0 shadow-sm`}>
                          {info?.emoji || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {TOPIK_LABEL[sesi.topic] || sesi.topic}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(sesi.created_at)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${peratusColor}`}>
                            {sesi.correct_count}/{sesi.total_questions}
                          </p>
                          <p className="text-xs text-slate-400">{peratus}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => router.push(`/pilih-sesi?anak=${selectedChild?.id}`)}
              className="w-full bg-gradient-to-r from-violet-800 to-indigo-800 hover:from-violet-700
                         hover:to-indigo-700 text-white font-bold rounded-2xl py-4
                         shadow-md shadow-violet-200 active:scale-95 transition-all"
            >
              Mula Sesi Belajar →
            </button>
          </>
        )}
      </div>
      </main>
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
