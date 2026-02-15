"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  Download,
  Plus,
  Edit,
  FileText,
} from "lucide-react"
import { DeleteLeadButton } from "@/components/leads/delete-lead-button"
import { useRouter, useSearchParams } from "next/navigation"

interface Lead {
  id: string
  name: string
  company?: string | null
  stage?: { name: string } | null
  expected_value?: number | null
  ai_score?: number | null
  status?: string
  source?: string | null
}

interface LeadsTableProps {
  leads: Lead[]
  newLeadHref: string
  baseEditLeadHref: string
}

function getScoreColor(score: number) {
  if (score >= 75)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
  if (score >= 50)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
}

export function LeadsTable({
  leads,
  newLeadHref,
  baseEditLeadHref,
}: LeadsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [stage, setStage] = useState("")
  const [source, setSource] = useState("")

  /* Sync state with URL on load */
  useEffect(() => {
    setSearch(searchParams.get("search") || "")
    setStage(searchParams.get("stage") || "")
    setSource(searchParams.get("source") || "")
  }, [searchParams])

  function applyFilters() {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (stage) params.set("stage", stage)
    if (source) params.set("source", source)

    router.push(`/admin/leads?${params.toString()}`)
  }

  function handleExport() {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (stage) params.set("stage", stage)
    if (source) params.set("source", source)

    window.location.href = `/api/leads/export?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* ================= Toolbar ================= */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
        {/* Search */}
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
          </select>

          <button
            onClick={applyFilters}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            Apply
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <Link
            href="/admin/leads/import"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <FileText className="w-4 h-4" />
            Import CSV
          </Link>

          <Link
            href={newLeadHref}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </Link>
        </div>
      </div>

      {/* ================= Table ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  AI Score
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase">
                  Value
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`${baseEditLeadHref}/${lead.id}`}
                      className="font-medium hover:text-indigo-600"
                    >
                      {lead.name}
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {lead.company ?? "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(
                        lead.ai_score ?? 0
                      )}`}
                    >
                      {lead.ai_score ?? 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    ₹ {(lead.expected_value ?? 0).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Link
                      href={`${baseEditLeadHref}/${lead.id}`}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteLeadButton leadId={lead.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
