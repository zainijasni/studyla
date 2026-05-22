'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TAHUN_OPTIONS = [1, 2, 3, 4, 5]

const SUBJEK = [
  { id: 'matematik',        emoji: '🔢', label: 'Matematik',       desc: 'Nombor, tambah, tolak, darab & lebih',  grad: 'from-violet-500 to-indigo-600' },
  { id: 'bahasa-melayu',   emoji: '✍️', label: 'Bahasa Melayu',  desc: 'Tatabahasa, karangan & pemahaman',       grad: 'from-emerald-500 to-teal-600' },
  { id: 'bahasa-inggeris', emoji: '🔤', label: 'Bahasa Inggeris', desc: 'Grammar, vocabulary & writing',          grad: 'from-sky-500 to-blue-600' },
  { id: 'sains',            emoji: '🔬', label: 'Sains',           desc: 'Haiwan, tumbuhan, jirim & bumi',        grad: 'from-amber-500 to-orange-500' },
]

const STEPS = ['welcome', 'anak', 'subjek']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [nama, setNama] = useState('')
  const [tahun, setTahun] = useState(3)
  const [subjekPilih, setSubjekPilih] = useState(null)
  const [childId, setChildId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // Guard: must be logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) router.push('/login')
    })
  }, [router])

  const totalSteps = STEPS.length
  const pct = Math.round(((step + 1) / totalSteps) * 100)

  async function saveChild() {
    setSaving(true)
    setErr('')
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('children')
      .insert({ parent_id: user.id, name: nama.trim(), year: tahun })
      .select().single()

    setSaving(false)
    if (error) { setErr('Gagal simpan. Cuba lagi.'); return }
    setChildId(data.id)
    setStep(2)
  }

  function finish() {
    if (!childId) { router.push('/dashboard'); return }
    if (subjekPilih) {
      router.push(`/pilih-sesi?anak=${childId}&subjek=${subjekPilih}`)
    } else {
      router.push(`/pilih-sesi?anak=${childId}`)
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Top progress */}
      <div className="bg-gradient-to-r from-violet-800 to-indigo-900 px-5 pt-10 pb-4 flex-shrink-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            {step > 0 && (
              <button onClick={() => router.push('/dashboard')}
                className="text-xs text-white/60 hover:text-white transition-colors border border-white/20 px-3 py-1.5 rounded-lg">
                Langkau
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-white/60 font-medium flex-shrink-0">{step + 1}/{totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6">

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="text-center pt-4">
                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Selamat datang ke StudyLa!</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Platform belajar yang reka khusus untuk ibu bapa ajar anak di rumah.
                </p>
              </div>

              {/* 3 layer explanation */}
              <div className="space-y-3">
                {[
                  { num: 1, emoji: '🧠', color: 'bg-violet-50 border-violet-200', text: 'text-violet-700',
                    title: 'Faham Soalan',
                    desc: 'Ibu bapa bantu anak faham apa yang soalan tanya — bukan terus bagi jawapan.' },
                  { num: 2, emoji: '💡', color: 'bg-sky-50 border-sky-200', text: 'text-sky-700',
                    title: 'Cara Selesaikan',
                    desc: 'Tunjuk kaedah penyelesaian langkah demi langkah tanpa dedah jawapan.' },
                  { num: 3, emoji: '✏️', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700',
                    title: 'Cuba Jawab',
                    desc: 'Anak cuba sendiri. Betul? Teruskan. Hampir? Ulang dari layer 2.' },
                ].map(l => (
                  <div key={l.num} className={`flex gap-3 p-3.5 rounded-2xl border ${l.color}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${l.color}`}>
                      {l.emoji}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${l.text}`}>Layer {l.num} — {l.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setStep(1)}
                className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white font-bold
                           rounded-2xl py-4 shadow-lg active:scale-[0.98] transition-all mt-2">
                Jom Mulakan! →
              </button>
            </div>
          )}

          {/* ── Step 1: Tambah Anak ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 mb-1">Siapa nama anak?</h2>
                <p className="text-sm text-slate-400">Boleh tambah lebih ramai anak selepas ini.</p>
              </div>

              {err && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <span>⚠️</span> {err}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Nama Anak</label>
                <input
                  type="text" value={nama} onChange={e => setNama(e.target.value)}
                  placeholder="Contoh: Aisyah, Haziq..."
                  autoFocus
                  className="w-full border-2 border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-sm
                             focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">Tahun Persekolahan</label>
                <div className="grid grid-cols-5 gap-2">
                  {TAHUN_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => setTahun(t)}
                      className={`py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95
                        ${tahun === t
                          ? 'bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-md'
                          : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-violet-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">Tahun {tahun} dipilih</p>
              </div>

              <button
                onClick={saveChild}
                disabled={saving || !nama.trim()}
                className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white font-bold
                           rounded-2xl py-4 shadow-lg active:scale-[0.98] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : 'Seterusnya →'}
              </button>
            </div>
          )}

          {/* ── Step 2: Pilih Subjek ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-black text-slate-800 mb-1">
                  Nak mula dengan subjek apa? 🎯
                </h2>
                <p className="text-sm text-slate-400">
                  Untuk {nama}, Tahun {tahun}. Boleh tukar bila-bila masa.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SUBJEK.map(s => {
                  const selected = subjekPilih === s.id
                  return (
                    <button key={s.id} onClick={() => setSubjekPilih(selected ? null : s.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97]
                        ${selected
                          ? 'border-violet-400 bg-violet-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-violet-200'}`}>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-2xl shadow-sm`}>
                        {s.emoji}
                      </div>
                      <p className={`text-xs font-bold text-center leading-tight ${selected ? 'text-violet-700' : 'text-slate-700'}`}>
                        {s.label}
                      </p>
                      {selected && (
                        <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">✓ Dipilih</span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button onClick={finish}
                  className="w-full bg-gradient-to-r from-violet-700 to-indigo-700 text-white font-bold
                             rounded-2xl py-4 shadow-lg active:scale-[0.98] transition-all">
                  {subjekPilih ? 'Mula Sesi Pertama! 🚀' : 'Pergi ke Dashboard →'}
                </button>
                {!subjekPilih && (
                  <p className="text-center text-xs text-slate-400">Pilih subjek untuk terus ke sesi belajar</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
