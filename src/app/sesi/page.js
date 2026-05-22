'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Layer config (warna berbeza tiap layer) ────────────────────────────────

const LAYER_CONFIG = {
  1: {
    label: 'Faham Soalan',
    emoji: '🧠',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-600',
    text: 'text-violet-700',
    light: 'bg-violet-100',
    btn: 'from-violet-600 to-purple-700',
    barColor: 'bg-violet-500',
    headerGrad: 'from-violet-700 to-purple-800',
  },
  2: {
    label: 'Cara Selesaikan',
    emoji: '💡',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-600',
    text: 'text-sky-700',
    light: 'bg-sky-100',
    btn: 'from-sky-500 to-blue-700',
    barColor: 'bg-sky-500',
    headerGrad: 'from-sky-600 to-blue-800',
  },
  3: {
    label: 'Cuba Jawab',
    emoji: '✏️',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600',
    text: 'text-emerald-700',
    light: 'bg-emerald-100',
    btn: 'from-emerald-500 to-teal-600',
    barColor: 'bg-emerald-500',
    headerGrad: 'from-emerald-600 to-teal-800',
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupSoalanByLayers(rows) {
  const map = {}
  rows.forEach((row) => {
    const key = row.question_text
    if (!map[key]) map[key] = {}
    map[key][row.layer] = row
  })
  const grouped = Object.values(map).filter((s) => s[1])
  return grouped.sort(() => Math.random() - 0.5)
}

// ─── Layer Stepper ────────────────────────────────────────────────────────────

function LayerStepper({ currentLayer }) {
  const steps = [
    { num: 1, emoji: '🧠', label: 'Faham' },
    { num: 2, emoji: '💡', label: 'Cara' },
    { num: 3, emoji: '✏️', label: 'Cuba' },
  ]
  return (
    <div className="flex items-center gap-2 mb-4">
      {steps.map(({ num, emoji, label }, i) => {
        const cfg = LAYER_CONFIG[num]
        const done = currentLayer > num
        const active = currentLayer === num
        return (
          <div key={num} className="flex items-center flex-1">
            <div className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold
              transition-all duration-300
              ${done ? 'bg-emerald-100 text-emerald-700'
                : active ? `${cfg.bg} ${cfg.text} ring-1 ${cfg.border}`
                : 'bg-slate-100 text-slate-400'}`}>
              <span className="text-sm leading-none">{done ? '✓' : emoji}</span>
              <span className="truncate hidden sm:inline">{label}</span>
            </div>
            {i < 2 && (
              <div className={`h-px w-3 mx-0.5 transition-colors duration-500
                ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Parent Script ────────────────────────────────────────────────────────────

function ParentScript({ text, namaAnak }) {
  if (!text) return null
  const formatted = text.replace(/\[Nama\]/g, namaAnak)
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
        💬
      </div>
      <div className="flex-1 bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-none px-3.5 py-2.5">
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">Cakap dengan anak</p>
        <p className="text-sm text-amber-900 leading-relaxed">"{formatted}"</p>
      </div>
    </div>
  )
}

// ─── Layer 1 — Faham Soalan ───────────────────────────────────────────────────

function Layer1({ soalan, namaAnak, onFaham }) {
  const cfg = LAYER_CONFIG[1]
  const breakdown = soalan[1]?.question_breakdown || []

  return (
    <div className="flex flex-col gap-3">
      {/* Soalan card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`${cfg.bg} border-b ${cfg.border} px-4 py-2.5 flex items-center gap-2`}>
          <span className="text-base">📋</span>
          <span className={`text-xs font-bold ${cfg.text} uppercase tracking-wider`}>Soalan</span>
        </div>
        <div className="px-4 py-4">
          <p className="text-[15px] text-slate-800 leading-relaxed font-medium">
            {soalan[1]?.question_text}
          </p>
        </div>
      </div>

      {/* Panduan faham */}
      {breakdown.length > 0 && (
        <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
          <p className={`text-xs font-bold ${cfg.text} uppercase tracking-wider mb-3 flex items-center gap-1.5`}>
            <span>🧩</span> Bantu anak faham soalan
          </p>
          <ul className="space-y-2.5">
            {breakdown.map((s, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className={`${cfg.badge} text-white text-[10px] font-black w-5 h-5 rounded-full
                                 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ParentScript text={soalan[1]?.parent_script} namaAnak={namaAnak} />

      <button
        onClick={onFaham}
        className={`w-full bg-gradient-to-r ${cfg.btn} text-white font-bold rounded-2xl py-4 text-sm
                   shadow-lg active:scale-[0.98] transition-all mt-1`}
      >
        Anak Faham ✓
      </button>
    </div>
  )
}

// ─── Layer 2 — Cara Selesaikan ────────────────────────────────────────────────

function Layer2({ soalan, namaAnak, onFaham }) {
  const cfg = LAYER_CONFIG[2]
  const steps = soalan[2]?.answer_steps || []
  const breakdown = soalan[2]?.question_breakdown || []

  return (
    <div className="flex flex-col gap-3">
      {/* Soalan mini — reminder */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
        <span className="text-slate-300 text-xs mt-0.5">📋</span>
        <p className="text-xs text-slate-500 leading-relaxed">{soalan[1]?.question_text}</p>
      </div>

      {/* Soalan panduan */}
      {breakdown.length > 0 && (
        <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
          <p className={`text-xs font-bold ${cfg.text} uppercase tracking-wider mb-3 flex items-center gap-1.5`}>
            <span>🤔</span> Tanya anak soalan ini
          </p>
          <ul className="space-y-2.5">
            {breakdown.map((s, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className={`text-sm ${cfg.text} font-black flex-shrink-0 mt-0.5`}>›</span>
                <span className="text-sm text-slate-700 leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Langkah penyelesaian */}
      {steps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
            <span className="text-base">📝</span>
            <span className={`text-xs font-bold ${cfg.text} uppercase tracking-wider`}>Jalan Kerja</span>
          </div>
          <div className="p-4 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className={`${cfg.badge} text-white text-[10px] font-black w-5 h-5 rounded-full
                                 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ParentScript text={soalan[2]?.parent_script} namaAnak={namaAnak} />

      <button
        onClick={onFaham}
        className={`w-full bg-gradient-to-r ${cfg.btn} text-white font-bold rounded-2xl py-4 text-sm
                   shadow-lg active:scale-[0.98] transition-all mt-1`}
      >
        Faham Cara ✓
      </button>
    </div>
  )
}

// ─── Layer 3 — Cuba Jawab ─────────────────────────────────────────────────────

function Layer3({ soalan, namaAnak, cubaan, onBetul, onHampirBetul }) {
  const cfg = LAYER_CONFIG[3]
  const steps = soalan[3]?.answer_steps || []
  const jawapan = soalan[3]?.answer || soalan[1]?.answer || ''

  return (
    <div className="flex flex-col gap-3">
      {/* Soalan mini */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
        <span className="text-slate-300 text-xs mt-0.5">📋</span>
        <p className="text-xs text-slate-500 leading-relaxed">{soalan[1]?.question_text}</p>
      </div>

      {/* Rujukan ibu bapa */}
      {steps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className={`${cfg.bg} border-b ${cfg.border} px-4 py-2.5 flex items-center gap-2`}>
            <span className="text-base">📖</span>
            <span className={`text-xs font-bold ${cfg.text} uppercase tracking-wider`}>Rujukan Ibu Bapa</span>
          </div>
          <div className="p-4 space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-slate-300 text-xs mt-1 flex-shrink-0">▸</span>
                <p className="text-sm text-slate-700 leading-snug font-mono">{step}</p>
              </div>
            ))}
            {jawapan && (
              <div className={`mt-2 pt-3 border-t ${cfg.border} flex items-center gap-2`}>
                <span className={`text-xs font-bold ${cfg.text} flex-shrink-0`}>Jawapan:</span>
                <span className={`text-sm font-bold ${cfg.text} ${cfg.bg} px-2.5 py-1 rounded-lg`}>{jawapan}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <ParentScript text={soalan[3]?.parent_script} namaAnak={namaAnak} />

      {/* Cubaan hint */}
      {cubaan >= 2 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
          <span className="text-base flex-shrink-0">⚠️</span>
          <p className="text-xs text-orange-700 font-medium">
            Anak cuba {cubaan} kali — mungkin perlu ulang topik asas dulu.
          </p>
        </div>
      )}

      {/* Action buttons — stacked untuk clarity */}
      <div className="flex flex-col gap-2.5 mt-1">
        <button
          onClick={onBetul}
          className={`w-full bg-gradient-to-r ${cfg.btn} text-white font-bold rounded-2xl py-4 text-base
                     shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
        >
          <span>✓</span> Betul!
        </button>
        <button
          onClick={onHampirBetul}
          className="w-full bg-white border-2 border-slate-200 text-slate-600 font-semibold
                     rounded-2xl py-3.5 text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>↩</span> Cuba Lagi
        </button>
      </div>
    </div>
  )
}

// ─── Main Session Page ────────────────────────────────────────────────────────

function SesiContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const anakId = searchParams.get('anak')
  const subjek = searchParams.get('subjek')
  const topik = searchParams.get('topik')
  const tahun = parseInt(searchParams.get('tahun') || '3')

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [anak, setAnak] = useState(null)
  const [soalanList, setSoalanList] = useState([])
  const [sessionId, setSessionId] = useState(null)

  const [soalanIdx, setSoalanIdx] = useState(0)
  const [layer, setLayer] = useState(1)
  const [cubaan, setCubaan] = useState(0)
  const [results, setResults] = useState([])
  const [selesai, setSelesai] = useState(false)

  useEffect(() => {
    async function loadSesi() {
      // ── Auth (local cache — no network) ────────────────────────────────────
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { router.push('/login'); return }

      // ── Ambil maklumat anak ─────────────────────────────────────────────────
      const { data: childData } = await supabase
        .from('children').select('*').eq('id', anakId).single()
      if (!childData) { router.push('/dashboard'); return }
      setAnak(childData)

      // ── Kira pool soalan untuk topik+tahun ini ──────────────────────────────
      const POOL_TARGET = 300   // bila pool cukup, recycle je — tak generate lagi
      const MIN_POOL    = 3     // 1 AI call untuk seed (3 soalan = 9 rows), lepas tu serve dari pool

      const { count: poolCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('subject', subjek).eq('topic', topik).eq('year', tahun)
        .eq('layer', 1).eq('is_approved', true)

      const pool = poolCount || 0
      const hasPool = pool >= MIN_POOL

      // Cooldown check — kalau ada soalan baru dalam 5 minit, jangan generate lagi
      // Ini prevent ramai user concurrent trigger AI untuk topik yang sama
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count: recentCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('subject', subjek).eq('topic', topik).eq('year', tahun)
        .eq('layer', 1).gte('created_at', fiveMinAgo)

      const recentlyGenerated = (recentCount || 0) > 0
      // Generate hanya kalau: pool < MIN_POOL DAN tiada generation dalam 5 minit lepas
      const needGenerate = !hasPool && !recentlyGenerated

      // ── Cooldown active tapi pool masih kosong — tunggu sekejap ─────────────
      // (user lain sedang generate, bagi masa dia save dulu)
      if (!needGenerate && !hasPool && recentlyGenerated) {
        await new Promise(r => setTimeout(r, 4000))
        // Reload page supaya dapat soalan yang baru disave
        window.location.reload()
        return
      }

      // ── Serve dari pool (pool cukup) ────────────────────────────────────────
      if (!needGenerate) {
        // Random offset supaya user tak dapat soalan sama tiap sesi
        // Setiap fetch ambil 60 rows (= ~6 soalan × 3 layers)
        const maxOffset = Math.max(0, pool - 20) // layer-1 count; actual rows = pool × 3
        const randomOffset = maxOffset > 0 ? Math.floor(Math.random() * maxOffset) * 3 : 0

        const { data: rows } = await supabase
          .from('questions')
          .select('*')
          .eq('subject', subjek).eq('topic', topik).eq('year', tahun)
          .eq('is_approved', true)
          .order('created_at', { ascending: randomOffset % 2 === 0 }) // tukar asc/desc secara random
          .range(randomOffset, randomOffset + 59)

        const grouped = groupSoalanByLayers(rows || [])
        setSoalanList(grouped)

        const { data: sesiRow } = await supabase.from('sessions')
          .insert({ child_id: anakId, parent_id: user.id, subject: subjek, topic: topik, year: tahun, total_questions: grouped.length })
          .select().single()
        if (sesiRow) setSessionId(sesiRow.id)
        setLoading(false)
        return
      }

      // ── Generate dari AI (pool terlalu sikit) ───────────────────────────────
      // Jangan generate kalau pool dah penuh (walaupun MIN_POOL belum tercapai sebab filter lain)
      if (pool >= POOL_TARGET) {
        // Edge case: pool penuh tapi tahun ini tak cukup — serve apa ada
        const { data: rows } = await supabase.from('questions').select('*')
          .eq('subject', subjek).eq('topic', topik).eq('year', tahun).eq('is_approved', true).limit(60)
        const grouped = groupSoalanByLayers(rows || [])
        setSoalanList(grouped)
        const { data: sesiRow } = await supabase.from('sessions')
          .insert({ child_id: anakId, parent_id: user.id, subject: subjek, topic: topik, year: tahun, total_questions: grouped.length })
          .select().single()
        if (sesiRow) setSessionId(sesiRow.id)
        setLoading(false)
        return
      }

      // Generate baru
      setGenerating(true)
      setLoading(false)
      try {
        const res = await fetch('/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: subjek, topic: topik, year: tahun }),
        })
        const genData = await res.json()
        if (!genData.success) throw new Error(genData.error || 'Gagal jana soalan')

        // Ambil soalan baru yang baru digenerate
        const { data: newRows } = await supabase
          .from('questions').select('*')
          .eq('subject', subjek).eq('topic', topik).eq('year', tahun)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(30) // 3 soalan × 3 layers baru

        if (newRows && newRows.length > 0) {
          const grouped = groupSoalanByLayers(newRows)
          setSoalanList(grouped)
          const { data: { user } } = await supabase.auth.getUser()
          const { data: sesiRow } = await supabase.from('sessions')
            .insert({ child_id: anakId, parent_id: user.id, subject: subjek, topic: topik, year: tahun, total_questions: grouped.length })
            .select().single()
          if (sesiRow) setSessionId(sesiRow.id)
        }
      } catch (err) {
        setGenerateError(err.message || 'Gagal jana soalan. Cuba lagi.')
      }
      setGenerating(false)
    }
    loadSesi()
  }, [anakId, subjek, topik, tahun, router])

  function handleFahamLayer() { setLayer((p) => p + 1) }

  async function handleBetul() {
    await saveResult(true)
    nextSoalan(true)
  }

  async function handleHampirBetul() {
    setCubaan((p) => p + 1)
    setLayer(2)
  }

  async function saveResult(correct) {
    const soalan = soalanList[soalanIdx]
    if (!sessionId || !soalan[1]) return
    await supabase.from('session_questions').insert({
      session_id: sessionId,
      question_id: soalan[1].id,
      layer_reached: 3,
      stuck_at_layer: cubaan > 0 ? 3 : null,
      attempts: cubaan + 1,
      correct,
    })
    setResults((prev) => [...prev, { correct, cubaan: cubaan + 1 }])
  }

  function nextSoalan(correct) {
    if (soalanIdx + 1 >= soalanList.length) {
      finishSession(correct)
    } else {
      setSoalanIdx((p) => p + 1)
      setLayer(1)
      setCubaan(0)
    }
  }

  async function finishSession(lastCorrect) {
    const allResults = [...results, { correct: lastCorrect }]
    const betulCount = allResults.filter((r) => r.correct).length
    const total = soalanList.length
    const peratus = Math.round((betulCount / total) * 100)
    const status = peratus >= 80 ? 'mastered' : peratus >= 50 ? 'progressing' : 'struggling'

    if (sessionId) {
      await supabase.from('sessions').update({ completed: true, correct_count: betulCount }).eq('id', sessionId)
    }
    await supabase.from('topic_progress').upsert({
      child_id: anakId, subject: subjek, topic: topik, year: tahun, status,
      last_session_at: new Date().toISOString(),
    }, { onConflict: 'child_id,subject,topic' })
    await supabase.rpc('increment_topic_sessions', { p_child_id: anakId, p_subject: subjek, p_topic: topik }).catch(() => {})
    setSelesai(true)
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-900 to-indigo-900 flex flex-col items-center justify-center gap-5 px-6">
        <img src="/logo.png" alt="StudyLa" className="h-10 object-contain opacity-80 mb-2" />
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {generating ? '✨' : '📚'}
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-base">
            {generating ? 'Menjana soalan baru...' : 'Memuatkan sesi...'}
          </p>
          <p className="text-white/50 text-sm mt-1">
            {generating ? 'AI sedang cipta soalan. Sekejap!' : subjek && topik ? `${subjek} • Tahun ${tahun}` : 'Tunggu sebentar...'}
          </p>
        </div>
      </div>
    )
  }

  // ── Error / Empty ────────────────────────────────────────────────────────────

  if (soalanList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">
          {generateError ? 'Gagal jana soalan' : 'Soalan belum tersedia'}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8 max-w-xs">
          {generateError || 'Bank soalan untuk topik ini akan ditambah tidak lama lagi.'}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {generateError && (
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-bold py-3.5 rounded-2xl"
            >
              Cuba Lagi
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white border border-slate-200 text-slate-600 font-semibold py-3 rounded-2xl text-sm"
          >
            Kembali ke Laman Utama
          </button>
        </div>
      </div>
    )
  }

  // ── Selesai ──────────────────────────────────────────────────────────────────

  if (selesai) {
    const betul = results.filter((r) => r.correct).length
    const total = soalanList.length
    const peratus = Math.round((betul / total) * 100)
    const isHebat = peratus >= 80
    const isOk = peratus >= 50
    const grade = isHebat ? { emoji: '🌟', label: 'Hebat!', grad: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
                : isOk    ? { emoji: '👍', label: 'Bagus!',  grad: 'from-sky-500 to-blue-600',     bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200' }
                :            { emoji: '💪', label: 'Cuba Lagi!', grad: 'from-orange-400 to-rose-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Hero */}
        <div className={`bg-gradient-to-br ${grade.grad} px-5 pt-14 pb-20 text-center relative overflow-hidden`}>
          {/* Decorative */}
          <div className="absolute top-4 left-6 text-white/10 text-5xl font-black">★</div>
          <div className="absolute top-8 right-10 text-white/10 text-3xl font-black">★</div>
          <div className="absolute bottom-8 left-12 text-white/10 text-4xl font-black">✦</div>

          <div className="text-7xl mb-3 relative">{grade.emoji}</div>
          <h1 className="text-2xl font-black text-white mb-1">{grade.label}</h1>
          <p className="text-white/70 text-sm">{anak?.name} — {total} soalan selesai</p>
        </div>

        <div className="max-w-lg mx-auto px-4 -mt-10 pb-8 w-full">
          {/* Score card */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-5 mb-4">
            {/* Big score */}
            <div className="text-center mb-4 pb-4 border-b border-slate-100">
              <p className={`text-6xl font-black ${isHebat ? 'text-emerald-500' : isOk ? 'text-sky-500' : 'text-orange-500'}`}>
                {peratus}%
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Markah</p>
            </div>

            {/* Stats row */}
            <div className="flex justify-around items-center mb-4">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-500">{betul}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">✓ Betul</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-center">
                <p className="text-2xl font-black text-rose-400">{total - betul}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">✗ Perlu Latihan</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-center">
                <p className="text-2xl font-black text-slate-600">{total}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Jumlah</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${grade.grad} transition-all duration-1000`}
                style={{ width: `${peratus}%` }}
              />
            </div>
          </div>

          {/* Mesej motivasi */}
          <div className={`rounded-2xl px-4 py-3 text-sm text-center mb-5 font-medium ${grade.bg} ${grade.text} border ${grade.border}`}>
            {isHebat
              ? `Tahniah! ${anak?.name} dah faham topik ini dengan baik. Teruskan! 🎉`
              : isOk
              ? `${anak?.name} dalam proses — sambung lagi esok! 💪`
              : `${anak?.name} perlu lebih latihan. Jangan putus asa, cuba lagi! 📚`}
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => router.push(`/pilih-sesi?anak=${anakId}`)}
              className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white font-bold
                         rounded-2xl py-4 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Sesi Baru <span>→</span>
            </button>
            <button
              onClick={() => router.push(`/laporan?anak=${anakId}`)}
              className="w-full bg-white border border-slate-200 text-slate-600 font-semibold
                         rounded-2xl py-3.5 text-sm active:scale-[0.98] transition-all"
            >
              Lihat Kemajuan 📊
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────

  const soalan = soalanList[soalanIdx]
  const namaAnak = anak?.name || 'Anak'
  const totalSoalan = soalanList.length
  const cfg = LAYER_CONFIG[layer]
  const progressPct = Math.round(((soalanIdx + (layer - 1) / 3) / totalSoalan) * 100)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top bar */}
      <div className={`bg-gradient-to-r ${cfg.headerGrad} px-4 pt-12 pb-4 sticky top-0 z-10`}>
        <div className="max-w-lg mx-auto">
          {/* Row 1: back + soalan counter */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white/70 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span className="text-xs font-semibold">Berhenti</span>
            </button>

            <div className={`${cfg.bg} px-3 py-1 rounded-full flex items-center gap-1.5`}>
              <span className="text-sm">{cfg.emoji}</span>
              <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
            </div>

            <div className="text-right">
              <span className="text-white font-black text-lg leading-none">{soalanIdx + 1}</span>
              <span className="text-white/40 text-sm">/{totalSoalan}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-white rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 flex-1 w-full pb-8">
        <LayerStepper currentLayer={layer} />

        {layer === 1 && <Layer1 soalan={soalan} namaAnak={namaAnak} onFaham={handleFahamLayer} />}
        {layer === 2 && <Layer2 soalan={soalan} namaAnak={namaAnak} onFaham={handleFahamLayer} />}
        {layer === 3 && (
          <Layer3
            soalan={soalan}
            namaAnak={namaAnak}
            cubaan={cubaan}
            onBetul={handleBetul}
            onHampirBetul={handleHampirBetul}
          />
        )}
      </div>

    </div>
  )
}

export default function SesiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
      </div>
    }>
      <SesiContent />
    </Suspense>
  )
}
