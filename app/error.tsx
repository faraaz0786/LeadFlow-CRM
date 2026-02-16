"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border text-center space-y-4">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-sm text-slate-500">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
