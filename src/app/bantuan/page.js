'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FAQS = [
  {
    section: 'Tentang StudyLa',
    items: [
      {
        q: 'Apa itu StudyLa?',
        a: 'StudyLa adalah platform belajar untuk ibu bapa dan anak. Ia menggunakan kaedah 3 Lapisan untuk membantu ibu bapa pandu anak belajar dengan cara yang berstruktur — bukan sekadar bagi jawapan.',
      },
      {
        q: 'Subjek apa yang tersedia?',
        a: 'Matematik, Bahasa Melayu, Bahasa Inggeris, dan Sains. Merangkumi Tahun 1 hingga 5 mengikut kurikulum KSSR Semakan.',
      },
      {
        q: 'Adakah StudyLa percuma?',
        a: 'Ya, percuma untuk digunakan semasa fasa ujian ini.',
      },
    ],
  },
  {
    section: 'Kaedah 3 Lapisan',
    items: [
      {
        q: 'Apa itu Kaedah 3 Lapisan?',
        a: 'Ia adalah pendekatan belajar yang dipecahkan kepada 3 peringkat — Layer 1 (Faham Soalan), Layer 2 (Cara Selesaikan), dan Layer 3 (Cuba Jawab). Setiap lapisan membantu anak memahami soalan sebelum menjawab.',
      },
      {
        q: 'Kenapa tidak terus bagi jawapan?',
        a: 'Kajian menunjukkan kanak-kanak belajar lebih baik bila mereka faham proses, bukan hafal jawapan. Kaedah ini membina keyakinan dan kemahiran berfikir.',
      },
      {
        q: 'Apa yang ibu bapa perlu buat semasa sesi?',
        a: 'Baca arahan di skrin dan cakap dengan anak mengikut skrip yang disediakan. StudyLa akan pandu langkah demi langkah.',
      },
    ],
  },
  {
    section: 'Akaun & Profil',
    items: [
      {
        q: 'Berapa profil anak boleh ditambah?',
        a: 'Tiada had. Boleh tambah seberapa banyak anak di bawah satu akaun ibu bapa.',
      },
      {
        q: 'Boleh tukar nama atau tahun anak?',
        a: 'Ya, pergi ke Dashboard → tekan ikon Edit pada kad profil anak.',
      },
      {
        q: 'Bagaimana nak tukar kata laluan?',
        a: 'Pergi ke Tetapan → bahagian Tukar Kata Laluan.',
      },
    ],
  },
  {
    section: 'Sesi Belajar',
    items: [
      {
        q: 'Berapa lama satu sesi?',
        a: 'Dalam 10–15 minit. Setiap sesi mengandungi beberapa soalan mengikut topik yang dipilih.',
      },
      {
        q: 'Boleh berhenti di tengah sesi?',
        a: 'Boleh tekan butang ✕ di atas. Sesi yang tidak selesai tidak akan disimpan dalam laporan.',
      },
      {
        q: 'Kenapa soalan lambat muncul?',
        a: 'Jika soalan untuk topik tersebut belum ada dalam sistem, AI akan jana soalan baru secara automatik. Ini mengambil masa 10–15 saat sahaja.',
      },
    ],
  },
  {
    section: 'Laporan',
    items: [
      {
        q: 'Apa yang ditunjukkan dalam Laporan?',
        a: 'Bilangan sesi, ketepatan jawapan, streak harian, status per topik (Dah Faham / Dalam Proses / Perlu Bantuan), dan cadangan topik seterusnya.',
      },
      {
        q: 'Apakah maksud status "Perlu Bantuan"?',
        a: 'Topik ini anak menjawab kurang dari 50% dengan betul. Disyorkan untuk ulang topik asas sebelum teruskan.',
      },
    ],
  },
]

export default function BantuanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [openIdx, setOpenIdx] = useState(null) // e.g. "0-1"

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  function toggle(key) {
    setOpenIdx(prev => (prev === key ? null : key))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-10 pb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <img src="/logo.png" alt="StudyLa" className="h-7 object-contain" />
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white text-xs border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Dashboard
          </button>
        </div>
        <h1 className="text-white text-xl font-bold">Bantuan & Soalan Lazim</h1>
        <p className="text-violet-300 text-xs mt-1">Jawapan kepada soalan yang kerap ditanya.</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pb-8 px-5">
        <div className="max-w-lg mx-auto pt-6 space-y-6">

          {FAQS.map((group, sIdx) => (
            <div key={sIdx}>
              {/* Section title */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {group.section}
              </p>

              {/* Accordion items */}
              <div className="space-y-2">
                {group.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`
                  const isOpen = openIdx === key
                  return (
                    <div
                      key={iIdx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
                      >
                        <span className="font-semibold text-slate-800 text-sm leading-snug">
                          {item.q}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-3 border-t border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Feedback CTA */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl flex-shrink-0">💜</span>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Bagi Maklum Balas</p>
                <p className="text-violet-200 text-xs mt-0.5">Bantu kami tingkatkan StudyLa. Ambil masa &lt;2 minit.</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/feedback'}
              className="mt-3 w-full bg-white text-violet-800 font-bold text-sm py-3 rounded-xl active:scale-95 transition-all">
              Isi Borang Maklum Balas →
            </button>
          </div>

          {/* Contact section */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">Ada soalan lain?</p>
            <p className="text-sm text-slate-500">
              Hubungi kami di{' '}
              <a
                href="mailto:zaini.jasni@gmail.com"
                className="text-violet-700 font-medium underline underline-offset-2"
              >
                zaini.jasni@gmail.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
