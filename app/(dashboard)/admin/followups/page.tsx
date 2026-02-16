import { Metadata } from "next"
import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { updateFollowupStatusAction } from "@/app/actions/followups"

export const metadata: Metadata = {
  title: "Follow-ups | LeadFlow CRM",
  description: "Manage scheduled follow-ups",
}

export default async function AdminFollowupsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("lead_followups")
    .select(`
      id,
      followup_at,
      status,
      note,
      lead:leads(name),
      rep:users!lead_followups_created_by_fkey(name)
    `)
    .order("followup_at", { ascending: true })

  if (error) {
    console.error("FOLLOWUPS ERROR:", error)
  }

  const followups = data ?? []
  const now = new Date()

  /* ===========================
     STATUS BUCKETS
  ============================ */

  const overdue = followups.filter(
    (f: any) =>
      f.status === "pending" &&
      new Date(f.followup_at) < now
  )

  const today = followups.filter((f: any) => {
    const date = new Date(f.followup_at)
    return (
      f.status === "pending" &&
      date.toDateString() === now.toDateString()
    )
  })

  const upcoming = followups.filter(
    (f: any) =>
      f.status === "pending" &&
      new Date(f.followup_at) > now
  )

  const completed = followups.filter(
    (f: any) => f.status === "done"
  )

  const missed = followups.filter(
    (f: any) => f.status === "missed"
  )

  /* ===========================
     STATUS BADGE
  ============================ */

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      case "done":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      case "missed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  /* ===========================
     SECTION COMPONENT
  ============================ */

  function Section({
    title,
    items,
    color,
  }: {
    title: string
    items: any[]
    color: string
  }) {
    return (
      <div className="space-y-4">
        <h2 className={`text-lg font-semibold ${color}`}>
          {title} ({items.length})
        </h2>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 shadow-sm">
            No follow-ups.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((f: any) => (
              <div
                key={f.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {f.lead?.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {f.note || "No note"}
                    </p>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap text-right">
                    <div>
                      {format(new Date(f.followup_at), "PP p")}
                    </div>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        f.status
                      )}`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>

                {f.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <form
                      action={async () => {
                        "use server"
                        await updateFollowupStatusAction(f.id, "done")
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                      >
                        Mark Done
                      </button>
                    </form>

                    <form
                        action={async () => {
                          "use server"
                          await updateFollowupStatusAction(f.id, "missed")
                          }}
                      >
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Mark Missed
                      </button>
                    </form>
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-500">
                  Created by: {f.rep?.name || "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ===========================
     PAGE RENDER
  ============================ */

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Follow-ups"
      pageSubtitle="Track scheduled actions"
    >
      <div className="space-y-12">
        <Section title="Overdue" items={overdue} color="text-red-600" />
        <Section title="Today" items={today} color="text-amber-600" />
        <Section title="Upcoming" items={upcoming} color="text-indigo-600" />
        <Section title="Completed" items={completed} color="text-emerald-600" />
        <Section title="Missed" items={missed} color="text-red-500" />
      </div>
    </AppShell>
  )
}
