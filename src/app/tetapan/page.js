'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function TetapanPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Tukar kata laluan
  const [passwordLama, setPasswordLama] = useState('')
  const [passwordBaru, setPasswordBaru] = useState('')
  const [passwordSahkan, setPasswordSahkan] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState(null) // { type: 'ok'|'err', text }

  // Tukar nama
  const [nama, setNama] = useState('')
  const [savingNama, setSavingNama] = useState(false)
  const [namaMsg, setNamaMsg] = useState(null)

  // Modal log keluar
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setNama(user.user_metadata?.full_name || '')
      setLoading(false)
    }
    load()
  }, [router])

  async function handleTukarNama(e) {
    e.preventDefault()
    if (!nama.trim()) return
    setSavingNama(true)
    setNamaMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: nama.trim() } })
    setSavingNama(false)
    setNamaMsg(error
      ? { type: 'err', text: 'Gagal kemaskini nama.' }
      : { type: 'ok', text: 'Nama berjaya dikemaskini!' }
    )
  }

  async function handleTukarPassword(e) {
    e.preventDefault()
    setPassMsg(null)
    if (passwordBaru.length < 6) {
      setPassMsg({ type: 'err', text: 'Kata laluan baru mesti sekurang-kurangnya 6 aksara.' })
      return
    }
    if (passwordBaru !== passwordSahkan) {
      setPassMsg({ type: 'err', text: 'Kata laluan baru tidak sepadan.' })
      return
    }
    setSavingPass(true)
    const { error } = await supabase.auth.updateUser({ password: passwordBaru })
    setSavingPass(false)
    if (error) {
      setPassMsg({ type: 'err', text: 'Gagal tukar kata laluan. Cuba log masuk semula.' })
    } else {
      setPassMsg({ type: 'ok', text: 'Kata laluan berjaya ditukar!' })
      setPasswordLama('')
      setPasswordBaru('')
      setPasswordSahkan('')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-800 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <button onClick={() => router.push('/dashboard')}
              className="text-white/60 hover:text-white text-xs border border-white/20
                         px-3 py-1.5 rounded-lg transition-colors">
              ← Dashboard
            </button>
          </div>
          <h1 className="text-white text-xl md:text-2xl font-bold">Tetapan</h1>
          <p className="text-violet-300 text-xs md:text-sm mt-1">Urus akaun dan keutamaan anda.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-5 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Info akaun */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-base">👤</span>
              <h2 className="font-bold text-slate-700 text-sm">Maklumat Akaun</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Email</span>
                <span className="text-sm text-slate-700 font-semibold">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Akaun sejak</span>
                <span className="text-sm text-slate-700">
                  {new Date(user?.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Kemaskini nama */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-base">✏️</span>
              <h2 className="font-bold text-slate-700 text-sm">Kemaskini Nama</h2>
            </div>
            <form onSubmit={handleTukarNama} className="px-5 py-4 space-y-3">
              {namaMsg && (
                <div className={`text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-2
                  ${namaMsg.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {namaMsg.type === 'ok' ? '✅' : '⚠️'} {namaMsg.text}
                </div>
              )}
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Nama penuh"
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
                           focus:bg-white transition-all"
              />
              <button type="submit" disabled={savingNama || !nama.trim()}
                className="w-full bg-gradient-to-r from-violet-800 to-indigo-800 text-white font-bold
                           rounded-xl py-3 text-sm hover:from-violet-900 hover:to-indigo-900
                           active:scale-95 transition-all disabled:opacity-50">
                {savingNama ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : 'Simpan Nama'}
              </button>
            </form>
          </div>

          {/* Tukar kata laluan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-base">🔒</span>
              <h2 className="font-bold text-slate-700 text-sm">Tukar Kata Laluan</h2>
            </div>
            <form onSubmit={handleTukarPassword} className="px-5 py-4 space-y-3">
              {passMsg && (
                <div className={`text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-2
                  ${passMsg.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {passMsg.type === 'ok' ? '✅' : '⚠️'} {passMsg.text}
                </div>
              )}
              {[
                { label: 'Kata Laluan Baru', val: passwordBaru, set: setPasswordBaru },
                { label: 'Sahkan Kata Laluan Baru', val: passwordSahkan, set: setPasswordSahkan },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 pr-10 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
                                 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)}
                  className="rounded accent-violet-700" />
                <span className="text-xs text-slate-500">Tunjuk kata laluan</span>
              </label>
              <button type="submit" disabled={savingPass || !passwordBaru || !passwordSahkan}
                className="w-full bg-gradient-to-r from-violet-800 to-indigo-800 text-white font-bold
                           rounded-xl py-3 text-sm hover:from-violet-900 hover:to-indigo-900
                           active:scale-95 transition-all disabled:opacity-50">
                {savingPass ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menukar...
                  </span>
                ) : 'Tukar Kata Laluan'}
              </button>
            </form>
          </div>

          {/* Tentang */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <h2 className="font-bold text-slate-700 text-sm">Tentang StudyLa</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Versi', value: '1.0.0' },
                { label: 'Kurikulum', value: 'KSSR Semakan 2017' },
                { label: 'Tahun Disokong', value: 'Tahun 1 — 5' },
                { label: 'Subjek', value: 'Matematik, BM, BI, Sains' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                  <span className="text-sm text-slate-700 font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Log keluar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowLogout(true)}
              className="w-full flex items-center gap-3 px-5 py-4 text-red-500
                         hover:bg-red-50 transition-colors text-left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="text-sm font-bold">Log Keluar</span>
            </button>
          </div>

        </div>
        </div>
      </main>

      {/* Modal log keluar */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">👋</div>
              <h2 className="text-lg font-bold text-slate-800">Log Keluar?</h2>
              <p className="text-sm text-slate-500 mt-1">Anda perlu log masuk semula untuk guna StudyLa.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-2xl text-sm
                           hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl text-sm
                           active:scale-95 transition-all">
                Ya, Log Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg z-30"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around">
          {[
            { label: 'Utama', href: '/dashboard', icon: '🏠' },
            { label: 'Kemajuan', href: '/laporan', icon: '📊' },
            { label: 'Tetapan', href: '/tetapan', icon: '⚙️' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 py-3 flex-1 transition-colors
                ${item.href === '/tetapan' ? 'text-violet-700' : 'text-slate-400 hover:text-violet-600'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
