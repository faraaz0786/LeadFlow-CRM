"use client"

import { updateFollowupStatusAction } from "@/app/actions/followups"
import { format } from "date-fns"
import { useMemo, useState } from "react"

type FollowupStatus = "pending" | "done" | "missed"
type FollowupTab = "all" | "today" | "upcoming" | "overdue" | "completed"

export interface RepFollowupItem {
  id: string
  followup_at: string
  status: FollowupStatus
  note: string | null
  lead: {
    id: string
    name: string | null
    company: string | null
    stage: {
      name: string | null
    } | null
  } | null
}

function getDayBoundaries() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )

  return { now, startOfToday, endOfToday }
}

export function RepFollowupsClient({ followups }: { followups: RepFollowupItem[] }) {
  const [items, setItems] = useState<RepFollowupItem[]>(followups)
  const [activeTab, setActiveTab] = useState<FollowupTab>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const summary = useMemo(() => {
    const { now, startOfToday, endOfToday } = getDayBoundaries()

    const overdue = items.filter(
      (item) => item.status === "pending" && new Date(item.followup_at) < startOfToday
    ).length

    const today = items.filter((item) => {
      if (item.status !== "pending") return false
      const date = new Date(item.followup_at)
      return date >= startOfToday && date <= endOfToday
    }).length

    const upcoming = items.filter(
      (item) => item.status === "pending" && new Date(item.followup_at) > endOfToday
    ).length

    const completed = items.filter((item) => item.status === "done").length

    return { overdue, today, upcoming, completed, now }
  }, [items])

  const filteredItems = useMemo(() => {
    const { startOfToday, endOfToday } = getDayBoundaries()

    if (activeTab === "all") return items
    if (activeTab === "completed") {
      return items.filter((item) => item.status === "done")
    }

    if (activeTab === "overdue") {
      return items.filter(
        (item) =>
          item.status === "pending" && new Date(item.followup_at) < startOfToday
      )
    }

    if (activeTab === "today") {
      return items.filter((item) => {
        if (item.status !== "pending") return false
        const date = new Date(item.followup_at)
        return date >= startOfToday && date <= endOfToday
      })
    }

    return items.filter(
      (item) => item.status === "pending" && new Date(item.followup_at) > endOfToday
    )
  }, [activeTab, items])

  async function handleMarkComplete(id: string) {
    const previous = items
    setUpdatingId(id)

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "done" } : item
      )
    )

    const result = await updateFollowupStatusAction(id, "done")
    if (!result.success) {
      setItems(previous)
    }
    setUpdatingId(null)
  }

  const tabs: { key: FollowupTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "overdue", label: "Overdue" },
    { key: "completed", label: "Completed" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.overdue}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Today</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.today}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Upcoming</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.upcoming}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.completed}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                ].join(" ")}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No follow-ups found for this filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const followupDate = new Date(item.followup_at)
            const now = new Date()
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const isOverdue = item.status === "pending" && followupDate < startOfToday

            return (
              <div
                key={item.id}
                className={[
                  "rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md",
                  isOverdue ? "border-red-200 border-l-4 border-l-red-300" : "border-slate-200",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.lead?.name ?? "Unnamed Lead"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{item.lead?.company ?? "No company"}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.lead?.stage?.name ?? "No stage"}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {format(followupDate, "PP p")}
                    </p>
                    {item.note ? <p className="text-xs text-slate-500">{item.note}</p> : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        item.status === "done"
                          ? "bg-emerald-50 text-emerald-700"
                          : isOverdue
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {item.status === "done" ? "Completed" : isOverdue ? "Overdue" : "Pending"}
                    </span>

                    <button
                      type="button"
                      disabled={item.status === "done" || updatingId === item.id}
                      onClick={() => void handleMarkComplete(item.id)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === item.id ? "Saving..." : "Mark Complete"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
