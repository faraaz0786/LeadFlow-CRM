"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { UploadCloud, FileText, Loader2 } from "lucide-react"

interface ImportResult {
  created: number
  skipped: number
  errors: { row: number; message: string }[]
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Import failed")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Import Leads"
      pageSubtitle="Upload CSV to bulk import leads"
    >
      <div className="max-w-3xl space-y-8">
        {/* Upload Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <UploadCloud className="w-7 h-7 text-white" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Upload CSV File
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Required headers: name, email, phone, company, location,
                source, expected_value, status
              </p>
            </div>

            <label className="w-full mt-4 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <div className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {file ? file.name : "Click to select CSV file"}
                </p>
              </div>
            </label>

            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Importing..." : "Start Import"}
            </button>

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Result Summary */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                label="Created"
                value={result.created}
                color="text-emerald-600"
              />
              <SummaryCard
                label="Skipped"
                value={result.skipped}
                color="text-amber-600"
              />
              <SummaryCard
                label="Errors"
                value={result.errors.length}
                color="text-red-600"
              />
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Error Details
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b">
                        <th className="py-2 pr-4">Row</th>
                        <th className="py-2">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((e, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 pr-4">{e.row}</td>
                          <td className="py-2 text-red-500">
                            {e.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  )
}
