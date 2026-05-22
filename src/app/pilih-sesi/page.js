'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SUBJEK_DATA = {
  matematik: {
    label: 'Matematik', emoji: '🔢',
    grad: 'from-violet-500 to-indigo-600',
    selBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',
    selBorder: 'border-indigo-400',
    topikBg: 'from-violet-600 to-indigo-700',
    topik: [
      { id: 'nombor-bulat', label: 'Nombor Bulat & Nilai Tempat', tahunMin: 1 },
      { id: 'tambah-tolak', label: 'Tambah dan Tolak', tahunMin: 1 },
      { id: 'darab-bahagi', label: 'Darab dan Bahagi', tahunMin: 2 },
      { id: 'wang', label: 'Wang & Kewangan', tahunMin: 1 },
      { id: 'masa-waktu', label: 'Masa dan Waktu', tahunMin: 1 },
      { id: 'ukuran', label: 'Panjang, Jisim & Isipadu', tahunMin: 1 },
      { id: 'pecahan', label: 'Pecahan', tahunMin: 2 },
      { id: 'perpuluhan', label: 'Perpuluhan', tahunMin: 3 },
      { id: 'peratus', label: 'Peratus', tahunMin: 4 },
      { id: 'luas-perimeter', label: 'Luas dan Perimeter', tahunMin: 3 },
      { id: 'data-graf', label: 'Data dan Graf', tahunMin: 2 },
      { id: 'nisbah', label: 'Nisbah dan Kadaran', tahunMin: 5 },
    ],
  },
  'bahasa-melayu': {
    label: 'Bahasa Melayu', emoji: '✍️',
    grad: 'from-emerald-500 to-teal-600',
    selBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    selBorder: 'border-teal-400',
    topikBg: 'from-emerald-600 to-teal-700',
    topik: [
      { id: 'ejaan-bm', label: 'Ejaan & Sebutan', tahunMin: 1 },
      { id: 'tatabahasa-asas', label: 'Kata Nama & Kata Kerja', tahunMin: 1 },
      { id: 'tatabahasa-lanjut', label: 'Kata Adjektif & Kata Hubung', tahunMin: 2 },
      { id: 'pemahaman', label: 'Pemahaman & Inferens', tahunMin: 2 },
      { id: 'karangan', label: 'Karangan Berdasarkan Gambar', tahunMin: 3 },
      { id: 'simpulan-bahasa', label: 'Simpulan Bahasa & Peribahasa', tahunMin: 3 },
      { id: 'karangan-fakta', label: 'Karangan Fakta & Imaginatif', tahunMin: 4 },
      { id: 'ayat-majmuk', label: 'Ayat Majmuk & Penjodoh Bilangan', tahunMin: 4 },
    ],
  },
  'bahasa-inggeris': {
    label: 'Bahasa Inggeris', emoji: '🔤',
    grad: 'from-sky-500 to-blue-600',
    selBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    selBorder: 'border-blue-400',
    topikBg: 'from-sky-600 to-blue-700',
    topik: [
      { id: 'vocabulary', label: 'Vocabulary in Context', tahunMin: 1 },
      { id: 'phonics-spelling', label: 'Phonics & Spelling', tahunMin: 1 },
      { id: 'grammar-basic', label: 'Grammar — Nouns, Verbs & Adjectives', tahunMin: 1 },
      { id: 'grammar-tenses', label: 'Grammar — Tenses', tahunMin: 2 },
      { id: 'reading-comprehension', label: 'Reading Comprehension', tahunMin: 2 },
      { id: 'writing', label: 'Guided Writing (Picture-based)', tahunMin: 3 },
      { id: 'grammar-advanced', label: 'Grammar — Sentence Structure', tahunMin: 3 },
      { id: 'letter-writing', label: 'Informal Letter Writing', tahunMin: 4 },
    ],
  },
  sains: {
    label: 'Sains', emoji: '🔬',
    grad: 'from-amber-500 to-orange-500',
    selBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    selBorder: 'border-orange-400',
    topikBg: 'from-amber-600 to-orange-600',
    topik: [
      { id: 'deria', label: 'Deria & Fungsinya', tahunMin: 1 },
      { id: 'haiwan', label: 'Haiwan & Kepelbagaian Hayat', tahunMin: 1 },
      { id: 'tumbuhan', label: 'Tumbuhan & Proses Hidup', tahunMin: 2 },
      { id: 'cuaca', label: 'Cuaca & Alam Sekitar', tahunMin: 2 },
      { id: 'jirim', label: 'Jirim — Pepejal, Cecair, Gas', tahunMin: 3 },
      { id: 'manusia-badan', label: 'Sistem Badan Manusia', tahunMin: 3 },
      { id: 'cahaya-bunyi', label: 'Cahaya dan Bunyi', tahunMin: 4 },
      { id: 'daya-gerak', label: 'Daya dan Gerakan', tahunMin: 4 },
      { id: 'ekosistem', label: 'Ekosistem & Rantai Makanan', tahunMin: 5 },
      { id: 'bumi-sumber', label: 'Bumi & Sumber Asli', tahunMin: 5 },
    ],
  },
}

function PilihSesiContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anakId = searchParams.get('anak')
  const [anak, setAnak] = useState(null)
  const [subjekPilih, setSubjekPilih] = useState('matematik')
  const [topikPilih, setTopikPilih] = useState(null)

  useEffect(() => {
    async function loadAnak() {
      if (!anakId) { router.push('/dashboard'); return }
      const { data } = await supabase.from('children').select('*').eq('id', anakId).single()
      if (!data) { router.push('/dashboard'); return }
      setAnak(data)
    }
    loadAnak()
  }, [anakId, router])

  function handleMulaSesi() {
    if (!topikPilih || !anak) return
    router.push(`/sesi?${new URLSearchParams({ anak: anakId, subjek: subjekPilih, topik: topikPilih, tahun: anak.year })}`)
  }

  if (!anak) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  const subjekAktif = SUBJEK_DATA[subjekPilih]
  const topikTersedia = subjekAktif.topik.filter(t => t.tahunMin <= anak.year)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Dark navy header */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-12 pb-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <button onClick={() => router.back()}
              className="text-white/60 text-sm hover:text-white transition-colors border border-white/20
                         px-3 py-1 rounded-lg text-xs">
              ← Kembali
            </button>
          </div>
          <h1 className="text-white text-xl font-bold">Pilih Sesi Belajar</h1>
          <p className="text-violet-200 text-sm mt-1">
            Untuk <span className="text-white font-bold">{anak.name}</span> — Tahun {anak.year}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 pb-32">

        {/* Pilih Subjek */}
        <div className="mb-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Subjek</p>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(SUBJEK_DATA).map(([id, data]) => {
              const isActive = subjekPilih === id
              const topikCount = data.topik.filter(t => t.tahunMin <= anak.year).length
              return (
                <button key={id}
                  onClick={() => { setSubjekPilih(id); setTopikPilih(null) }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95
                    ${isActive
                      ? `bg-gradient-to-br ${data.grad} border-transparent shadow-lg text-white`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                  <div className="text-2xl mb-2">{data.emoji}</div>
                  <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{data.label}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{topikCount} topik</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pilih Topik */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Topik</p>
          {topikTersedia.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm text-slate-500">Tiada topik untuk Tahun {anak.year}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topikTersedia.map((topik) => {
                const isSelected = topikPilih === topik.id
                return (
                  <button key={topik.id} onClick={() => setTopikPilih(topik.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] flex items-center gap-3
                      ${isSelected
                        ? `bg-gradient-to-r ${subjekAktif.topikBg} border-transparent shadow-md`
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'border-white bg-white/20' : 'border-slate-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {topik.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button onClick={handleMulaSesi} disabled={!topikPilih}
            className="w-full bg-[#BE185D] hover:bg-[#9D174D] text-white font-bold rounded-2xl py-4
                       text-base shadow-lg shadow-rose-200 active:scale-95 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
            {topikPilih ? 'Mula Sesi Belajar →' : 'Pilih topik dahulu'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PilihSesiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
    </div>}>
      <PilihSesiContent />
    </Suspense>
  )
}
