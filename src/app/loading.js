// Global loading fallback — shown during initial navigation
export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900 px-5 pt-8 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="h-7 w-24 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="h-3 w-28 bg-white/20 rounded-full mb-2 animate-pulse" />
        <div className="h-7 w-44 bg-white/30 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 px-4 py-5 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded-full w-32" />
                <div className="h-3 bg-slate-100 rounded-full w-16" />
              </div>
            </div>
            <div className="h-11 bg-slate-100 rounded-xl mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
