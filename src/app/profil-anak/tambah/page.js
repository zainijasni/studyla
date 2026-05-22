'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TAHUN_OPTIONS = [1, 2, 3, 4, 5]

export default function TambahProfilAnakPage() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [tahun, setTahun] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('children').insert({
      parent_id: user.id,
      name: nama.trim(),
      year: tahun,
    })

    if (error) {
      setError('Gagal tambah profil. Cuba lagi.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-12 pb-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
            <button onClick={() => router.back()}
              className="text-white/60 hover:text-white text-xs border border-white/20
                         px-3 py-1 rounded-lg transition-colors">
              ← Kembali
            </button>
          </div>
          <h1 className="text-white text-xl font-bold">Tambah Profil Anak</h1>
          <p className="text-violet-200 text-sm mt-1">Satu akaun boleh ada beberapa profil anak.</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Nama Anak</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Aisyah, Haziq..."
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
                           focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-3">Tahun Persekolahan</label>
              <div className="flex gap-2">
                {TAHUN_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTahun(t)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95
                      ${tahun === t
                        ? 'bg-gradient-to-b from-[#BE185D] to-rose-600 text-white shadow-md shadow-rose-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Tahun {tahun} dipilih</p>
            </div>

            <button
              type="submit"
              disabled={loading || !nama.trim()}
              className="w-full bg-gradient-to-r bg-[#BE185D] hover:bg-[#9D174D] text-white font-bold
                         rounded-xl py-4 text-sm shadow-md shadow-rose-200
                         hover:from-pink-800 hover:to-rose-600 active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : 'Simpan Profil ✓'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
