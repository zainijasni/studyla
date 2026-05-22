'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

const AVATAR_GRAD = [
  'from-rose-300 to-pink-400',
  'from-violet-300 to-purple-400',
  'from-sky-300 to-blue-400',
  'from-emerald-300 to-teal-400',
  'from-amber-300 to-orange-400',
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('children').select('*').order('created_at', { ascending: true })
      setChildren(data || [])
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  const parentName = user?.user_metadata?.full_name?.split(' ')[0] || 'Parent'

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Banner */}
        <div className="relative bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900
                        px-5 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8 overflow-hidden flex-shrink-0">
          {/* Decorative blobs */}
          <div className="absolute top-3 right-20 text-white/20 text-2xl font-bold select-none">+</div>
          <div className="absolute top-8 right-40 text-white/10 text-xl font-bold select-none">+</div>
          <div className="absolute bottom-4 right-10 text-white/10 text-3xl font-bold select-none">+</div>
          <div className="absolute -bottom-4 right-32 w-28 h-28 bg-white/5 rounded-full" />
          <div className="absolute -top-8 right-4 w-36 h-36 bg-white/5 rounded-full" />

          <div className="relative">
            {/* Logo + Log keluar row */}
            <div className="flex items-center justify-between mb-5">
              <img src="/logo.png" alt="StudyLa" className="h-7 md:h-8 object-contain" />
              <button
                onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
                className="md:flex items-center gap-2 border border-white/30 text-white/80 text-xs
                           font-semibold px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log Keluar
              </button>
            </div>
            {/* Greeting */}
            <p className="text-violet-200 text-sm mb-1">Selamat datang,</p>
            <h1 className="text-white text-2xl md:text-3xl font-black">{parentName} 👋</h1>
            <p className="text-violet-300 text-xs md:text-sm mt-1.5">Pilih anak untuk mulakan sesi belajar.</p>
          </div>
        </div>

        {/* Scrollable content — pb accounts for mobile bottom nav */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-5 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto md:max-w-4xl">

            {children.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-sm mx-auto mt-4">
                <div className="text-5xl mb-3">👨‍👩‍👧</div>
                <h2 className="font-bold text-slate-800 text-lg mb-2">Tambah Profil Anak</h2>
                <p className="text-sm text-slate-500 mb-5">Mulakan dengan tambah profil anak pertama.</p>
                <button onClick={() => router.push('/profil-anak/tambah')}
                  className="w-full bg-gradient-to-r from-violet-800 to-indigo-800 hover:from-violet-900
                             hover:to-indigo-900 text-white font-bold px-6 py-3.5 rounded-xl
                             shadow-sm text-sm active:scale-95 transition-all">
                  + Tambah Profil Anak
                </button>
              </div>
            ) : (
              <>
                {/* Section header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base md:text-xl font-bold text-slate-800">Profil Anak</h2>
                  <button onClick={() => router.push('/profil-anak/tambah')}
                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white
                               text-xs md:text-sm font-bold px-3 py-2 md:px-4 rounded-xl
                               shadow-sm active:scale-95 transition-all">
                    <span className="text-base leading-none">+</span> Tambah Anak
                  </button>
                </div>

                {/* Child cards */}
                <div className="space-y-3 md:space-y-4">
                  {children.map((child, idx) => (
                    <div key={child.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm
                                 hover:shadow-md hover:border-violet-200 transition-all overflow-hidden">

                      {/* Card top */}
                      <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
                        {/* Avatar */}
                        <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br
                                        ${AVATAR_GRAD[idx % AVATAR_GRAD.length]}
                                        rounded-2xl flex items-center justify-center
                                        text-xl md:text-2xl font-black text-white shadow-sm flex-shrink-0`}>
                          {child.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-base md:text-lg truncate leading-tight">
                            {child.name}
                          </h3>
                          <span className="inline-block bg-violet-100 text-violet-700 text-xs font-bold
                                           px-2.5 py-0.5 rounded-full mt-1">
                            Tahun {child.year}
                          </span>
                          <p className="text-xs text-slate-400 mt-1 hidden sm:block">
                            📚 Teruskan perjalanan belajar hari ini!
                          </p>
                        </div>

                        {/* Action icons */}
                        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
                          <button onClick={() => router.push(`/laporan?anak=${child.id}`)}
                            className="flex flex-col items-center gap-0.5 p-2 rounded-xl
                                       hover:bg-slate-50 transition-colors group">
                            <svg className="text-slate-300 group-hover:text-violet-500 transition-colors"
                              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
                            </svg>
                            <span className="text-[9px] md:text-[10px] text-slate-400 group-hover:text-violet-500 font-medium">Statistik</span>
                          </button>
                          <button onClick={() => router.push(`/profil-anak/${child.id}`)}
                            className="flex flex-col items-center gap-0.5 p-2 rounded-xl
                                       hover:bg-slate-50 transition-colors group">
                            <svg className="text-slate-300 group-hover:text-violet-500 transition-colors"
                              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            <span className="text-[9px] md:text-[10px] text-slate-400 group-hover:text-violet-500 font-medium">Edit</span>
                          </button>
                        </div>
                      </div>

                      {/* Belajar button */}
                      <div className="px-4 pb-4 md:px-5 md:pb-5">
                        <button onClick={() => router.push(`/pilih-sesi?anak=${child.id}`)}
                          className="w-full bg-gradient-to-r from-violet-800 to-indigo-800
                                     hover:from-violet-900 hover:to-indigo-900
                                     text-white font-bold rounded-xl py-3 md:py-3.5 text-sm
                                     shadow-md shadow-violet-200 active:scale-[0.98] transition-all
                                     flex items-center justify-center gap-2">
                          Mulakan Sesi Belajar
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer tagline */}
                <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                  <span>🩷</span> Belajar hari ini, capai impian esok.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav — fixed, with safe area for iPhone notch */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100
                      shadow-lg z-30"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around">
          {[
            { label: 'Utama', href: '/dashboard', icon: '🏠' },
            { label: 'Kemajuan', href: '/laporan', icon: '📊' },
            { label: 'Tetapan', href: '/tetapan', icon: '⚙️' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 py-3 flex-1 transition-colors
                ${item.href === '/dashboard'
                  ? 'text-violet-700'
                  : 'text-slate-400 hover:text-violet-600'}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
