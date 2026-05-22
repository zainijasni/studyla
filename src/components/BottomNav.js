'use client'

import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'zaini.jasni@gmail.com'

export default function BottomNav({ user, active }) {
  const router = useRouter()
  const isAdmin = user?.email === ADMIN_EMAIL

  const items = [
    { label: 'Utama',    href: '/dashboard', icon: '🏠' },
    { label: 'Kemajuan', href: '/laporan',   icon: '📊' },
    { label: 'Tetapan',  href: '/tetapan',   icon: '⚙️' },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: '🛡️' }] : []),
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around">
        {items.map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center gap-0.5 py-3 flex-1 transition-colors
              ${active === item.href
                ? item.href === '/admin'
                  ? 'text-rose-600'
                  : 'text-violet-700'
                : 'text-slate-400 hover:text-violet-600'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
