'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email atau kata laluan tidak betul.'); setLoading(false); return }

    // Check if user has children — new user goes to onboarding
    const { data: kids } = await supabase.from('children').select('id').limit(1)
    if (!kids || kids.length === 0) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Dark navy hero */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-6 pt-16 pb-14 flex flex-col items-center">
        <img src="/logo.png" alt="StudyLa" className="h-14 object-contain drop-shadow-lg mb-3" />
        <p className="text-slate-400 text-sm text-center">Fahamkan dulu, baru latih tubi.</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 pb-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Log Masuk</h2>
        <p className="text-sm text-slate-400 mb-6">Selamat kembali! 👋</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@contoh.com" required
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                         focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Kata Laluan</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-11 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                           focus:bg-white transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#BE185D] hover:bg-[#9D174D] text-white font-bold rounded-xl py-3.5
                       text-sm shadow-lg shadow-rose-200 active:scale-95 transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sedang log masuk...
              </span>
            ) : 'Log Masuk →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Belum ada akaun?{' '}
          <Link href="/daftar" className="text-[#BE185D] font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  )
}
