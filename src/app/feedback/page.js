'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SOALAN = [
  {
    id: 'rating',
    label: 'Secara keseluruhan, bagaimana pengalaman anda dengan StudyLa?',
    type: 'stars',
  },
  {
    id: 'kaedah',
    label: 'Kaedah 3 Lapisan mudah diikuti?',
    type: 'choice',
    options: [
      { value: 'mudah',  label: 'Mudah sangat',   emoji: '😄' },
      { value: 'agak',   label: 'Agak-agak',       emoji: '🤔' },
      { value: 'susah',  label: 'Kurang faham',    emoji: '😅' },
    ],
  },
  {
    id: 'soalan_sesuai',
    label: 'Adakah soalan-soalan sesuai untuk tahap anak anda?',
    type: 'choice',
    options: [
      { value: 'sesuai', label: 'Sesuai',         emoji: '✅' },
      { value: 'mudah',  label: 'Terlalu mudah',  emoji: '📗' },
      { value: 'susah',  label: 'Terlalu susah',  emoji: '📕' },
    ],
  },
  {
    id: 'rekomen',
    label: 'Adakah anda akan cadangkan StudyLa kepada rakan?',
    type: 'choice',
    options: [
      { value: 'ya',      label: 'Pasti!',   emoji: '🌟' },
      { value: 'mungkin', label: 'Mungkin',  emoji: '🤷' },
      { value: 'tidak',   label: 'Tidak',    emoji: '❌' },
    ],
  },
  {
    id: 'suka',
    label: 'Apa yang paling anda suka? (boleh pilih lebih satu)',
    type: 'multi',
    options: [
      { value: 'kaedah',    label: 'Kaedah 3 Lapisan',    emoji: '🧠' },
      { value: 'laporan',   label: 'Laporan kemajuan',     emoji: '📊' },
      { value: 'subjek',    label: 'Pelbagai subjek',      emoji: '📚' },
      { value: 'mudah',     label: 'Mudah digunakan',      emoji: '📱' },
      { value: 'ai',        label: 'Soalan dijana AI',     emoji: '✨' },
    ],
  },
  {
    id: 'komen',
    label: 'Ada cadangan atau perkara yang ingin anda kongsikan?',
    type: 'text',
    placeholder: 'Cerita sikit... (tidak wajib)',
  },
]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2 justify-center py-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-4xl transition-transform active:scale-90"
        >
          <span className={(hover || value) >= star ? 'opacity-100' : 'opacity-20'}>⭐</span>
        </button>
      ))}
    </div>
  )
}

function FeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromSesi = searchParams.get('from') === 'sesi'

  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId] = useState(null)
  const [answers, setAnswers] = useState({ suka: [] })
  const [step, setStep] = useState(0)  // which question
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      // Check if already submitted feedback
      if (localStorage.getItem('studyla_feedback_done') === 'true') {
        setAlreadyDone(true)
      }
      setAuthReady(true)
    }
    checkAuth()
  }, [router])

  function setAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function toggleMulti(id, value) {
    setAnswers(prev => {
      const arr = prev[id] || []
      return {
        ...prev,
        [id]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function canProceed() {
    const q = SOALAN[step]
    if (q.type === 'text') return true  // optional
    if (q.type === 'stars') return (answers[q.id] || 0) >= 1
    if (q.type === 'multi') return true  // optional
    return !!answers[q.id]
  }

  function next() {
    if (step < SOALAN.length - 1) {
      setStep(s => s + 1)
    } else {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await supabase.from('feedback').insert({
        user_id: userId,
        rating:        answers.rating || null,
        kaedah:        answers.kaedah || null,
        soalan_sesuai: answers.soalan_sesuai || null,
        rekomen:       answers.rekomen || null,
        fungsi_gemar:  (answers.suka || []).join(','),
        komen:         answers.komen || null,
      })
    } catch (err) {
      console.error('Feedback insert error:', err)
    }
    localStorage.setItem('studyla_feedback_done', 'true')
    setSubmitting(false)
    setSubmitted(true)
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Already submitted
  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-10 pb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <button onClick={() => router.push('/dashboard')}
              className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg">
              ← Dashboard
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl mb-4">💜</div>
          <h2 className="font-black text-slate-800 text-xl mb-2">Terima kasih!</h2>
          <p className="text-sm text-slate-500 mb-6">Anda telah memberi feedback. Kami sangat menghargai masa anda.</p>
          <button onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-violet-700 to-indigo-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Submitted — thank you screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-5">💜</div>
        <h1 className="text-2xl font-black text-white mb-2">Terima kasih!</h1>
        <p className="text-violet-200 text-sm mb-2">Feedback anda sangat bermakna kepada kami.</p>
        <p className="text-violet-300 text-xs mb-10">DCK Tech akan gunakan maklum balas ini untuk tingkatkan StudyLa.</p>
        <div className="w-full max-w-xs space-y-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-full bg-white text-violet-800 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
            Kembali ke Dashboard
          </button>
          {fromSesi && (
            <button onClick={() => router.back()}
              className="w-full border border-white/30 text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-95 transition-all">
              Lihat Kemajuan 📊
            </button>
          )}
        </div>
      </div>
    )
  }

  const q = SOALAN[step]
  const progressPct = Math.round(((step + 1) / SOALAN.length) * 100)
  const isLast = step === SOALAN.length - 1

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-10 pb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
          <button onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg transition-colors">
            ← Langkau
          </button>
        </div>
        <h1 className="text-white font-bold text-base mb-1">Maklum Balas Beta</h1>
        <p className="text-violet-300 text-xs mb-3">Bantu kami tingkatkan StudyLa 💜</p>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-1.5 bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-white/50 text-[10px] font-semibold flex-shrink-0">{step + 1}/{SOALAN.length}</span>
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-4">
            <p className="text-sm font-semibold text-slate-700 leading-snug mb-4">{q.label}</p>

            {/* Stars */}
            {q.type === 'stars' && (
              <StarRating value={answers[q.id] || 0} onChange={v => setAnswer(q.id, v)} />
            )}

            {/* Single choice */}
            {q.type === 'choice' && (
              <div className="space-y-2.5">
                {q.options.map(opt => {
                  const selected = answers[q.id] === opt.value
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => setAnswer(q.id, opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]
                        ${selected
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                      <span className={`text-sm font-semibold ${selected ? 'text-violet-700' : 'text-slate-700'}`}>
                        {opt.label}
                      </span>
                      {selected && (
                        <span className="ml-auto text-violet-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Multi-select */}
            {q.type === 'multi' && (
              <div className="flex flex-wrap gap-2">
                {q.options.map(opt => {
                  const selected = (answers[q.id] || []).includes(opt.value)
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => toggleMulti(q.id, opt.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95
                        ${selected
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Text */}
            {q.type === 'text' && (
              <textarea
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={4}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white
                           resize-none transition-all text-slate-700 placeholder:text-slate-400"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-shrink-0 bg-white border border-slate-200 text-slate-500 font-semibold
                           px-5 py-3.5 rounded-2xl text-sm active:scale-95 transition-all">
                ← Balik
              </button>
            )}
            <button onClick={next} disabled={!canProceed() || submitting}
              className={`flex-1 font-bold rounded-2xl py-4 text-sm shadow-md active:scale-[0.98] transition-all
                ${canProceed()
                  ? 'bg-gradient-to-r from-violet-700 to-indigo-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {submitting ? 'Menghantar...' : isLast ? 'Hantar Feedback 💜' : 'Seterusnya →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  )
}
