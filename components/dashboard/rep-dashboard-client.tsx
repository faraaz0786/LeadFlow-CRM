"use client"

import { createFollowupAction } from "@/app/actions/followups"
import { updateLeadStatusAction } from "@/app/actions/leads"
import { createClient } from "@/lib/supabase"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Calendar, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface StageOption {
  id: string
  name: string
  stage_order: number
}

interface LeadRow {
  id: string
  name?: string | null
  company?: string | null
  expected_value?: number | null
  stage?: {
    name?: string | null
  } | null
  status?: string | null
  next_followup?: {
    followup_at?: string | null
    status?: string | null
  } | null
}

interface RepDashboardClientProps {
  totalAssignedLeads: number
  wonDeals: number
  conversionRate: number
  followupsDueToday: number
  overdueFollowups: number
  upcomingFollowups: number
  stageCounts: Record<string, number>
  leads: LeadRow[]
}

export function RepDashboardClient({
  totalAssignedLeads,
  wonDeals,
  conversionRate,
  followupsDueToday,
  overdueFollowups,
  upcomingFollowups,
  stageCounts,
  leads,
}: RepDashboardClientProps) {
  const [leadRows, setLeadRows] = useState<LeadRow[]>(leads ?? [])
  const [stages, setStages] = useState<StageOption[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [followupAt, setFollowupAt] = useState("")
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false)
  const [isUpdatingStage, setIsUpdatingStage] = useState<string | null>(null)

  useEffect(() => {
    setLeadRows(leads ?? [])
  }, [leads])

  useEffect(() => {
    async function loadStages() {
      const supabase = createClient()
      const { data } = await supabase
        .from("pipeline_stages")
        .select("id, name, stage_order")
        .order("stage_order", { ascending: true })

      setStages((data as StageOption[]) ?? [])
    }

    loadStages()
  }, [])

  const latestLeads = useMemo(() => leadRows.slice(0, 5), [leadRows])
  const stageData = useMemo(
    () =>
      Object.entries(stageCounts).map(([name, count]) => ({
        name,
        count,
      })),
    [stageCounts]
  )

  async function handleStageChange(leadId: string, stageId: string) {
    const selectedStage = stages.find((stage) => stage.id === stageId)
    if (!selectedStage) return
    const previousRows = leadRows.map((lead) => ({
      ...lead,
      stage: lead.stage ? { ...lead.stage } : null,
      next_followup: lead.next_followup ? { ...lead.next_followup } : null,
    }))

    setIsUpdatingStage(leadId)
    setLeadRows((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: stageId,
              stage: { name: selectedStage.name },
            }
          : lead
      )
    )

    const result = await updateLeadStatusAction(leadId, stageId)
    if (!result.success) {
      setLeadRows(previousRows)
    }
    setIsUpdatingStage(null)
  }

  function openFollowupModal(leadId: string) {
    setActiveLeadId(leadId)
    setFollowupAt("")
    setIsModalOpen(true)
  }

  async function handleFollowupSubmit() {
    if (!activeLeadId || !followupAt) return
    const parsedFollowupDate = new Date(followupAt)
    if (Number.isNaN(parsedFollowupDate.getTime())) return

    setIsSubmittingFollowup(true)
    const result = await createFollowupAction(activeLeadId, parsedFollowupDate.toISOString())

    if (result.success) {
      setLeadRows((current) =>
        current.map((lead) =>
          lead.id === activeLeadId
            ? {
                ...lead,
                next_followup: {
                  followup_at: parsedFollowupDate.toISOString(),
                  status: "pending",
                },
              }
            : lead
        )
      )
      setIsModalOpen(false)
      setActiveLeadId(null)
      setFollowupAt("")
    }

    setIsSubmittingFollowup(false)
  }

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg p-6"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">Assigned Leads</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{totalAssignedLeads}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg p-6"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">Won Deals</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{wonDeals}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg p-6"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">Conversion Rate</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{conversionRate}%</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg p-6"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">Follow-ups Due Today</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{followupsDueToday}</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.06 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-red-300 bg-white dark:bg-slate-900 shadow-sm p-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Overdue</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{overdueFollowups}</p>
          </div>
        </div>

        <div className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-300 bg-white dark:bg-slate-900 shadow-sm p-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Due Today</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{followupsDueToday}</p>
          </div>
        </div>

        <div className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-300 bg-white dark:bg-slate-900 shadow-sm p-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{upcomingFollowups}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Leads by Stage</h2>
        <div className="mt-4 h-[280px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 p-4">
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                    backgroundColor: "#fff",
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No stage data available.</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.14 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Assigned Leads Snapshot</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Name
                </th>
                <th className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Company
                </th>
                <th className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Stage
                </th>
                <th className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Expected Value
                </th>
                <th className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Next Follow-up
                </th>
                <th className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {latestLeads.length > 0 ? (
                latestLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium">{lead.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{lead.company || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{lead.stage?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right tabular-nums">
                      Rs {(lead.expected_value ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right">
                      {lead.next_followup?.followup_at
                        ? new Date(lead.next_followup.followup_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/rep/leads/${lead.id}`}
                          className="text-sm rounded-md px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          View
                        </Link>

                        <select
                          value={lead.status ?? ""}
                          onChange={(event) => {
                            const nextStageId = event.target.value
                            if (!nextStageId) return
                            void handleStageChange(lead.id, nextStageId)
                          }}
                          disabled={isUpdatingStage === lead.id}
                          className="text-sm rounded-md px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <option value="">Stage</option>
                          {stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => openFollowupModal(lead.id)}
                          className="text-sm rounded-md px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Follow-up
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <div className="mx-auto max-w-sm rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-6 text-center">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No assigned leads yet</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">New leads will appear here once they are assigned.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsModalOpen(false)
              setActiveLeadId(null)
              setFollowupAt("")
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Follow-up</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Schedule next follow-up for this lead.</p>
              </div>

              <input
                type="datetime-local"
                value={followupAt}
                onChange={(event) => setFollowupAt(event.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setActiveLeadId(null)
                    setFollowupAt("")
                  }}
                  className="text-sm rounded-md px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!followupAt || isSubmittingFollowup}
                  onClick={() => void handleFollowupSubmit()}
                  className="text-sm rounded-md px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isSubmittingFollowup ? "Saving..." : "Save Follow-up"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
