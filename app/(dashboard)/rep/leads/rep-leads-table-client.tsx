"use client"

import { createFollowupAction } from "@/app/actions/followups"
import { LeadScoreBadge } from "@/components/ui/lead-score-badge"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

export interface RepLeadRow {
  id: string
  name: string | null
  email: string | null
  expected_value: number | null
  ai_score: number | null
  stage?: {
    name?: string | null
  } | null
}

export function RepLeadsTableClient({ leads }: { leads: RepLeadRow[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [followupAt, setFollowupAt] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const rows = useMemo(() => leads ?? [], [leads])

  function openModal(leadId: string) {
    setActiveLeadId(leadId)
    setFollowupAt("")
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setActiveLeadId(null)
    setFollowupAt("")
  }

  async function handleSaveFollowup() {
    if (!activeLeadId || !followupAt) return
    const parsedDate = new Date(followupAt)
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Please select a valid date and time.")
      return
    }

    setIsSaving(true)
    const result = await createFollowupAction(activeLeadId, parsedDate.toISOString())

    if (result.success) {
      toast.success("Follow-up scheduled successfully.")
      closeModal()
    } else {
      toast.error(result.error)
    }
    setIsSaving(false)
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500">Name</th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500">Email</th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500">Stage</th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500">Score</th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-right text-xs uppercase tracking-wide text-slate-500">Value</th>
                <th className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 text-right text-xs uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((lead) => {
                  const score = lead.ai_score ?? 0
                  const level = score >= 80 ? "hot" : score >= 50 ? "warm" : "cold"

                  return (
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{lead.name ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{lead.email ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{lead.stage?.name ?? "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <LeadScoreBadge score={score} level={level} />
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-700 tabular-nums">
                        ${(lead.expected_value ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/rep/leads/${lead.id}`}
                            className="text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => openModal(lead.id)}
                            className="text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Add Follow-up
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">
                    No leads assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-slate-200 p-6 space-y-4"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div>
                <h3 className="text-base font-semibold text-slate-900">Add Follow-up</h3>
                <p className="text-sm text-slate-500">Schedule a follow-up for this lead.</p>
              </div>

              <input
                type="datetime-local"
                value={followupAt}
                onChange={(event) => setFollowupAt(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveFollowup()}
                  disabled={!followupAt || isSaving}
                  className="text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
