'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  { emoji: '🧠', label: 'Layer 1', title: 'Faham Soalan', desc: 'Bantu anak faham apa yang soalan tanya — bukan terus bagi jawapan.', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  { emoji: '💡', label: 'Layer 2', title: 'Cara Selesaikan', desc: 'Tunjuk kaedah langkah demi langkah. Anak belajar proses, bukan hafal.', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700' },
  { emoji: '✏️', label: 'Layer 3', title: 'Cuba Jawab', desc: 'Anak cuba sendiri. Betul? Teruskan. Tak faham? Ulang dari layer 1.', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
]

const SUBJECTS = [
  { emoji: '🔢', label: 'Matematik', grad: 'from-violet-500 to-indigo-600' },
  { emoji: '✍️', label: 'Bahasa Melayu', grad: 'from-emerald-500 to-teal-600' },
  { emoji: '🔤', label: 'Bahasa Inggeris', grad: 'from-sky-500 to-blue-600' },
  { emoji: '🔬', label: 'Sains', grad: 'from-amber-500 to-orange-500' },
]

const STEPS = [
  { num: '1', title: 'Daftar percuma', desc: 'Cipta akaun dalam masa 30 saat.' },
  { num: '2', title: 'Tambah profil anak', desc: 'Masukkan nama dan tahun persekolahan.' },
  { num: '3', title: 'Pilih topik & belajar', desc: 'Pilih subjek, dan StudyLa akan pandu anda.' },
]

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Logged-in users go straight to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.replace('/dashboard')
    })
  }, [router])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="bg-gradient-to-r from-violet-800 to-indigo-800 rounded-xl px-2.5 py-1.5">
            <img src="/logo.png" alt="StudyLa" className="h-5 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors">
              Log Masuk
            </Link>
            <Link href="/daftar"
              className="bg-gradient-to-r from-violet-700 to-indigo-700 text-white text-sm font-bold
                         px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 pt-28 pb-20 px-5 text-center relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-5 right-10 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 text-white/10 text-6xl font-black select-none">+</div>
        <div className="absolute bottom-16 left-16 text-white/10 text-4xl font-black select-none">✦</div>

        <div className="relative max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            🎓 Platform belajar untuk ibu bapa & anak
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
            Belajar Bersama,<br />
            <span className="text-violet-300">Faham Bersama.</span>
          </h1>
          <p className="text-violet-200 text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto">
            StudyLa bantu ibu bapa ajar anak dengan kaedah 3 lapisan — bukan sekadar bagi jawapan, tapi fahamkan cara berfikir.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/daftar"
              className="w-full sm:w-auto bg-white text-violet-800 font-black px-8 py-4 rounded-2xl
                         shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm">
              Daftar Percuma →
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl
                         hover:bg-white/10 active:scale-95 transition-all text-sm">
              Dah ada akaun? Log Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* ── Subjects strip ── */}
      <div className="bg-slate-50 border-b border-slate-100 py-5 px-5">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Subjek yang tersedia</p>
          <div className="grid grid-cols-4 gap-3">
            {SUBJECTS.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-2xl shadow-sm`}>
                  {s.emoji}
                </div>
                <p className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problem ── */}
      <div className="py-14 px-5">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3 text-center">Masalah biasa ibu bapa</p>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-8 leading-tight">
            "Anak tak faham soalan,<br />ibu bapa pun tak tahu<br />nak explain macam mana."
          </h2>
          <div className="space-y-3">
            {[
              { emoji: '😓', text: 'Anak dapat soalan, terus give up atau tanya jawapan je.' },
              { emoji: '😰', text: 'Ibu bapa nak bantu, tapi tak tahu cara nak explain dengan betul.' },
              { emoji: '🔄', text: 'Buat homework sama — esoknya lupa, buat balik. Tak ada progress.' },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                <span className="text-xl flex-shrink-0">{p.emoji}</span>
                <p className="text-sm text-slate-700 leading-snug">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3-Layer Solution ── */}
      <div className="py-14 px-5 bg-slate-50">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3 text-center">Penyelesaian StudyLa</p>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-2 leading-tight">
            Kaedah 3 Lapisan
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">Dipandu. Berstruktur. Berkesan.</p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.label} className={`flex gap-4 p-4 rounded-2xl border ${f.bg} ${f.border}`}>
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center text-xl flex-shrink-0`}>
                  {f.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-wide ${f.text}`}>{f.label}</span>
                    <span className="text-sm font-bold text-slate-800">— {f.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="py-14 px-5">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3 text-center">Mudah untuk mula</p>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-8">3 Langkah Sahaja</h2>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
                  {s.num}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="py-16 px-5 bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 text-center">
        <div className="max-w-lg mx-auto">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-black text-white mb-3">Mula Hari Ini, Percuma.</h2>
          <p className="text-violet-200 text-sm mb-8 max-w-xs mx-auto">
            Daftar dalam masa 30 saat. Tidak perlu kad kredit.
          </p>
          <Link href="/daftar"
            className="inline-block bg-white text-violet-800 font-black px-10 py-4 rounded-2xl
                       shadow-lg hover:shadow-xl active:scale-95 transition-all text-sm">
            Daftar Percuma Sekarang →
          </Link>
          <p className="text-violet-300/60 text-xs mt-5">
            Dah ada akaun?{' '}
            <Link href="/login" className="text-violet-300 hover:text-white underline transition-colors">Log masuk di sini</Link>
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-slate-900 py-6 px-5 text-center">
        <img src="/logo.png" alt="StudyLa" className="h-6 object-contain mx-auto mb-3 opacity-60" />
        <p className="text-xs text-slate-500">© 2025 StudyLa. Platform belajar untuk keluarga Malaysia.</p>
        <p className="text-xs text-slate-600 mt-1">Tahun 1–5 · Matematik · Bahasa Melayu · Bahasa Inggeris · Sains</p>
      </div>

    </div>
  )
}
