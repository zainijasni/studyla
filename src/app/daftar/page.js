'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DaftarPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDaftar(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password.length < 6) { setError('Kata laluan mesti sekurang-kurangnya 6 aksara.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Dark navy hero */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-6 pt-14 pb-12 flex flex-col items-center">
        <img src="/logo.png" alt="StudyLa" className="h-14 object-contain drop-shadow-lg mb-3" />
        <p className="text-slate-400 text-sm text-center">Platform belajar bersama ibu bapa.</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 pb-8 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Daftar Akaun</h2>
        <p className="text-sm text-slate-400 mb-6">Percuma untuk Matematik Tahun 1–2.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleDaftar} className="space-y-4">
          {[
            { label: 'Nama Penuh', value: fullName, set: setFullName, type: 'text', ph: 'Nama ibu / bapa' },
            { label: 'Email', value: email, set: setEmail, type: 'email', ph: 'email@contoh.com' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
                placeholder={f.ph} required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all" />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">No. Telefon</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="01X-XXXXXXXX" required
              className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Kata Laluan</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 aksara" required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-11 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition-all" />
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
                Mendaftar...
              </span>
            ) : 'Daftar Sekarang →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Dah ada akaun?{' '}
          <Link href="/login" className="text-[#BE185D] font-semibold hover:underline">Log masuk</Link>
        </p>
      </div>
    </div>
  )
}
