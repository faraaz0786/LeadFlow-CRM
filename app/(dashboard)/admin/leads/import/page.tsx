"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { UploadCloud, Loader2 } from "lucide-react"

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
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-slate-600" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900">
                Upload CSV File
              </h2>
              <p className="text-sm text-slate-500">
                Required headers: name, email, phone, company, location,
                source, expected_value, status
              </p>
            </div>

            <label className="w-full cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 hover:bg-slate-50 transition-colors">
                <p className="text-sm text-slate-500">
                  {file ? file.name : "Click to select CSV file"}
                </p>
              </div>
            </label>

            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-6 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Importing..." : "Start Import"}
            </button>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

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
              <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Error Details
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                        <th className="py-2 pr-4">Row</th>
                        <th className="py-2">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((e, idx) => (
                        <tr key={idx} className="border-b border-slate-200 last:border-0">
                          <td className="py-2 pr-4 text-sm text-slate-700">{e.row}</td>
                          <td className="py-2 text-sm text-red-500">
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
    <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  )
}
