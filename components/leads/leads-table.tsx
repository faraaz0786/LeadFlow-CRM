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

function getScoreDotClass(score: number) {
  if (score >= 71) return "bg-emerald-500"
  if (score >= 41) return "bg-amber-500"
  return "bg-red-500"
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
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-700"
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
            className="px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm text-slate-700"
          >
            <option value="">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
          </select>

          <button
            onClick={applyFilters}
            className="px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <Link
            href="/admin/leads/import"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Import CSV
          </Link>

          <Link
            href={newLeadHref}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Lead
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Name
                </th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Company
                </th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Status
                </th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  AI Score
                </th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-right text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Value
                </th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-right text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="text-sm text-slate-700 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`${baseEditLeadHref}/${lead.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {lead.name}
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    {lead.company ?? "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 rounded-full px-2 py-1 text-xs">
                      {lead.stage?.name ?? lead.status ?? "Unknown"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 text-slate-700">
                      <span
                        className={`h-2 w-2 rounded-full ${getScoreDotClass(
                          lead.ai_score ?? 0
                        )}`}
                      />
                      {lead.ai_score ?? 0}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-semibold">
                    Rs {(lead.expected_value ?? 0).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Link
                      href={`${baseEditLeadHref}/${lead.id}`}
                      className="p-2 hover:bg-slate-50 rounded-md"
                    >
                      <Edit className="w-4 h-4 text-slate-700" />
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
