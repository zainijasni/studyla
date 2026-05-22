'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TAHUN_OPTIONS = [1, 2, 3, 4, 5]

export default function EditProfilAnakPage() {
  const router = useRouter()
  const { id } = useParams()

  const [nama, setNama] = useState('')
  const [tahun, setTahun] = useState(3)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnak() {
      const { data, error } = await supabase.from('children').select('*').eq('id', id).single()
      if (error || !data) { router.push('/dashboard'); return }
      setNama(data.name)
      setTahun(data.year)
      setLoading(false)
    }
    loadAnak()
  }, [id, router])

  async function handleSave(e) {
    e.preventDefault()
    if (!nama.trim()) return
    setSaving(true)
    setError('')
    const { error } = await supabase.from('children').update({ name: nama.trim(), year: tahun }).eq('id', id)
    if (error) { setError('Gagal simpan. Cuba lagi.'); setSaving(false); return }
    router.push('/dashboard')
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('children').delete().eq('id', id)
    if (error) { setError('Gagal padam. Cuba lagi.'); setDeleting(false); setShowConfirmDelete(false); return }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
      </div>
    )
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
          <h1 className="text-white text-xl font-bold">Edit Profil Anak</h1>
          <p className="text-violet-200 text-sm mt-1">Kemaskini maklumat profil anak.</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Nama Anak</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={saving || !nama.trim()}
              className="w-full bg-gradient-to-r bg-[#BE185D] hover:bg-[#9D174D] text-white font-bold
                         rounded-xl py-4 text-sm shadow-md shadow-rose-200
                         hover:from-pink-800 hover:to-rose-600 active:scale-95 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : 'Simpan Perubahan ✓'}
            </button>
          </form>

          {/* Padam */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="w-full text-red-500 text-sm font-semibold py-3 rounded-xl
                         hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              🗑️ Padam Profil Ini
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-slate-800">Padam Profil?</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Semua data sesi dan laporan kemajuan akan dipadam.
                Tindakan ini <span className="font-bold text-red-500">tidak boleh dibatalkan.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3.5 rounded-2xl text-sm
                           hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-bold py-3.5 rounded-2xl text-sm
                           hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
              >
                {deleting ? 'Memadamkan...' : 'Ya, Padam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
