'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SUBJEK_DATA = {
  matematik: {
    label: 'Matematik', emoji: '🔢',
    grad: 'from-violet-500 to-indigo-600',
    btn: 'from-violet-700 to-indigo-700',
    ring: 'ring-violet-400',
    light: 'bg-violet-50 border-violet-200 text-violet-700',
    topik: [
      { id: 'nombor-bulat',   label: 'Nombor Bulat & Nilai Tempat', tahunMin: 1 },
      { id: 'tambah-tolak',   label: 'Tambah dan Tolak',            tahunMin: 1 },
      { id: 'darab-bahagi',   label: 'Darab dan Bahagi',            tahunMin: 2 },
      { id: 'wang',           label: 'Wang & Kewangan',             tahunMin: 1 },
      { id: 'masa-waktu',     label: 'Masa dan Waktu',              tahunMin: 1 },
      { id: 'ukuran',         label: 'Panjang, Jisim & Isipadu',   tahunMin: 1 },
      { id: 'pecahan',        label: 'Pecahan',                     tahunMin: 2 },
      { id: 'perpuluhan',     label: 'Perpuluhan',                  tahunMin: 3 },
      { id: 'peratus',        label: 'Peratus',                     tahunMin: 4 },
      { id: 'luas-perimeter', label: 'Luas dan Perimeter',          tahunMin: 3 },
      { id: 'data-graf',      label: 'Data dan Graf',               tahunMin: 2 },
      { id: 'nisbah',         label: 'Nisbah dan Kadaran',          tahunMin: 5 },
    ],
  },
  'bahasa-melayu': {
    label: 'Bahasa Melayu', emoji: '✍️',
    grad: 'from-emerald-500 to-teal-600',
    btn: 'from-emerald-700 to-teal-700',
    ring: 'ring-emerald-400',
    light: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    topik: [
      { id: 'ejaan-bm',         label: 'Ejaan & Sebutan',              tahunMin: 1 },
      { id: 'tatabahasa-asas',  label: 'Kata Nama & Kata Kerja',       tahunMin: 1 },
      { id: 'tatabahasa-lanjut',label: 'Kata Adjektif & Kata Hubung',  tahunMin: 2 },
      { id: 'pemahaman',        label: 'Pemahaman & Inferens',         tahunMin: 2 },
      { id: 'karangan',         label: 'Karangan Berdasarkan Gambar',  tahunMin: 3 },
      { id: 'simpulan-bahasa',  label: 'Simpulan Bahasa & Peribahasa', tahunMin: 3 },
      { id: 'karangan-fakta',   label: 'Karangan Fakta & Imaginatif',  tahunMin: 4 },
      { id: 'ayat-majmuk',      label: 'Ayat Majmuk & Penjodoh',       tahunMin: 4 },
    ],
  },
  'bahasa-inggeris': {
    label: 'Bahasa Inggeris', emoji: '🔤',
    grad: 'from-sky-500 to-blue-600',
    btn: 'from-sky-700 to-blue-700',
    ring: 'ring-sky-400',
    light: 'bg-sky-50 border-sky-200 text-sky-700',
    topik: [
      { id: 'vocabulary',             label: 'Vocabulary in Context',       tahunMin: 1 },
      { id: 'phonics-spelling',       label: 'Phonics & Spelling',          tahunMin: 1 },
      { id: 'grammar-basic',          label: 'Grammar — Nouns & Verbs',     tahunMin: 1 },
      { id: 'grammar-tenses',         label: 'Grammar — Tenses',            tahunMin: 2 },
      { id: 'reading-comprehension',  label: 'Reading Comprehension',       tahunMin: 2 },
      { id: 'writing',                label: 'Guided Writing',               tahunMin: 3 },
      { id: 'grammar-advanced',       label: 'Grammar — Sentence Structure', tahunMin: 3 },
      { id: 'letter-writing',         label: 'Informal Letter Writing',     tahunMin: 4 },
    ],
  },
  sains: {
    label: 'Sains', emoji: '🔬',
    grad: 'from-amber-500 to-orange-500',
    btn: 'from-amber-600 to-orange-600',
    ring: 'ring-amber-400',
    light: 'bg-amber-50 border-amber-200 text-amber-700',
    topik: [
      { id: 'deria',       label: 'Deria & Fungsinya',          tahunMin: 1 },
      { id: 'haiwan',      label: 'Haiwan & Kepelbagaian Hayat',tahunMin: 1 },
      { id: 'tumbuhan',    label: 'Tumbuhan & Proses Hidup',    tahunMin: 2 },
      { id: 'cuaca',       label: 'Cuaca & Alam Sekitar',       tahunMin: 2 },
      { id: 'jirim',       label: 'Jirim — Pepejal, Cecair, Gas',tahunMin: 3 },
      { id: 'manusia-badan',label: 'Sistem Badan Manusia',      tahunMin: 3 },
      { id: 'cahaya-bunyi',label: 'Cahaya dan Bunyi',           tahunMin: 4 },
      { id: 'daya-gerak',  label: 'Daya dan Gerakan',           tahunMin: 4 },
      { id: 'ekosistem',   label: 'Ekosistem & Rantai Makanan', tahunMin: 5 },
      { id: 'bumi-sumber', label: 'Bumi & Sumber Asli',         tahunMin: 5 },
    ],
  },
}

const STATUS_STYLE = {
  mastered:         { label: 'Faham ✓',       pill: 'bg-emerald-100 text-emerald-700' },
  progressing:      { label: 'Dalam Proses',  pill: 'bg-amber-100 text-amber-700' },
  struggling:       { label: 'Perlu Bantuan', pill: 'bg-red-100 text-red-600' },
  backtrack_needed: { label: 'Semak Balik',   pill: 'bg-orange-100 text-orange-700' },
}

const AVATAR_GRAD = ['from-rose-400 to-pink-500','from-violet-400 to-purple-500','from-sky-400 to-blue-500','from-emerald-400 to-teal-500','from-amber-400 to-orange-400']

function PilihSesiContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anakId   = searchParams.get('anak')
  const subjekParam = searchParams.get('subjek')

  const [anak, setAnak]           = useState(null)
  const [subjekPilih, setSubjekPilih] = useState(subjekParam || 'matematik')
  const [topikPilih, setTopikPilih]   = useState(null)
  const [progress, setProgress]   = useState({}) // { topicId: status }
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      if (!anakId) { router.push('/dashboard'); return }
      const [{ data: anakData }, { data: progressData }] = await Promise.all([
        supabase.from('children').select('*').eq('id', anakId).single(),
        supabase.from('topic_progress').select('topic, status').eq('child_id', anakId),
      ])
      if (!anakData) { router.push('/dashboard'); return }
      setAnak(anakData)
      const map = {}
      ;(progressData || []).forEach(p => { map[p.topic] = p.status })
      setProgress(map)
      setLoading(false)
    }
    load()
  }, [anakId, router])

  // Handle pre-selected subjek from onboarding/URL
  useEffect(() => {
    if (subjekParam && SUBJEK_DATA[subjekParam]) setSubjekPilih(subjekParam)
  }, [subjekParam])

  function handleMulaSesi() {
    if (!topikPilih || !anak) return
    router.push(`/sesi?${new URLSearchParams({ anak: anakId, subjek: subjekPilih, topik: topikPilih, tahun: anak.year })}`)
  }

  if (loading) return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-10 pb-6 flex-shrink-0">
        <div className="h-7 w-24 bg-white/20 rounded animate-pulse mb-6" />
        <div className="h-5 w-40 bg-white/20 rounded animate-pulse mb-2" />
        <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="flex-1 px-5 py-5 space-y-2">
        {[1,2,3,4].map(i => <div key={i} className="h-14 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
      </div>
    </div>
  )

  const subjekAktif   = SUBJEK_DATA[subjekPilih]
  const topikTersedia = subjekAktif.topik.filter(t => t.tahunMin <= anak.year)
  const anakIdx       = 0 // default avatar

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Header */}
      <div className={`bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-10 pb-5 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-4">
          <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
          <button onClick={() => router.back()}
            className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg transition-colors">
            ← Kembali
          </button>
        </div>
        {/* Child info */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${AVATAR_GRAD[anakIdx]} flex items-center justify-center text-white text-lg font-black shadow-sm flex-shrink-0`}>
            {anak.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-bold leading-tight">{anak.name}</p>
            <p className="text-violet-300 text-xs">Tahun {anak.year} · Pilih topik untuk belajar</p>
          </div>
        </div>
      </div>

      {/* Subject grid — 2×2, all visible at once */}
      <div className="bg-white border-b border-slate-100 flex-shrink-0 px-4 py-3">
        <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
          {Object.entries(SUBJEK_DATA).map(([id, s]) => {
            const isActive = subjekPilih === id
            const topikCount = s.topik.filter(t => t.tahunMin <= anak.year).length
            const doneCount  = s.topik.filter(t => t.tahunMin <= anak.year && progress[t.id] === 'mastered').length
            return (
              <button key={id}
                onClick={() => { setSubjekPilih(id); setTopikPilih(null) }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]
                  ${isActive
                    ? `bg-gradient-to-r ${s.grad} text-white shadow-md`
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                <span className="text-lg flex-shrink-0">{s.emoji}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-bold leading-tight truncate">{s.label}</p>
                  {doneCount > 0 && (
                    <p className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-white/80' : 'text-emerald-600'}`}>
                      {doneCount}/{topikCount} faham
                    </p>
                  )}
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Topic list — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="max-w-lg mx-auto space-y-2">
          {topikTersedia.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 mt-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm text-slate-500">Tiada topik untuk Tahun {anak.year}</p>
            </div>
          ) : (
            topikTersedia.map((topik) => {
              const isSelected = topikPilih === topik.id
              const status     = progress[topik.id]
              const statusCfg  = STATUS_STYLE[status]
              return (
                <button key={topik.id} onClick={() => setTopikPilih(isSelected ? null : topik.id)}
                  className={`w-full rounded-2xl border-2 text-left transition-all active:scale-[0.98] overflow-hidden
                    ${isSelected
                      ? `border-transparent shadow-lg bg-gradient-to-r ${subjekAktif.btn}`
                      : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3 p-3.5">
                    {/* Radio dot */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${isSelected ? 'border-white bg-white/20' : 'border-slate-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    {/* Label */}
                    <span className={`text-sm font-semibold flex-1 leading-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {topik.label}
                    </span>
                    {/* Status badge */}
                    {statusCfg && !isSelected && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg.pill}`}>
                        {statusCfg.label}
                      </span>
                    )}
                    {isSelected && status && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 bg-white/20 text-white">
                        {statusCfg?.label}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-4 py-3 shadow-lg"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="max-w-lg mx-auto">
          {topikPilih && (
            <p className="text-center text-xs text-slate-400 mb-2 truncate">
              {subjekAktif.emoji} {subjekAktif.topik.find(t => t.id === topikPilih)?.label}
            </p>
          )}
          <button onClick={handleMulaSesi} disabled={!topikPilih}
            className={`w-full text-white font-bold rounded-2xl py-4 text-sm shadow-lg
                       active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed
                       ${topikPilih ? `bg-gradient-to-r ${subjekAktif.btn}` : 'bg-slate-300'}`}>
            {topikPilih ? 'Mula Sesi Belajar →' : 'Pilih topik dahulu'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default function PilihSesiPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <PilihSesiContent />
    </Suspense>
  )
}
