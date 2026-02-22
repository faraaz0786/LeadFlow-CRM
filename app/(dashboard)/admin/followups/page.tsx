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

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700"
      case "done":
        return "bg-emerald-100 text-emerald-700"
      case "missed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  function Section({
    title,
    items,
  }: {
    title: string
    items: any[]
  }) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {title} ({items.length})
          </h2>
          <p className="text-sm text-slate-500">Follow-up tasks in this status bucket.</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-sm text-slate-500">
            No follow-ups.
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map((f: any) => (
              <div
                key={f.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-slate-700 font-medium">
                      {f.lead?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {f.note || "No note"}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 whitespace-nowrap text-right">
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
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server"
                        await updateFollowupStatusAction(f.id, "done")
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
                        className="px-3 py-1 text-xs rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        Mark Missed
                      </button>
                    </form>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  Created by: {f.rep?.name || "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Follow-ups"
      pageSubtitle="Track scheduled actions"
    >
      <div className="space-y-8">
        <Section title="Overdue" items={overdue} />
        <Section title="Today" items={today} />
        <Section title="Upcoming" items={upcoming} />
        <Section title="Completed" items={completed} />
        <Section title="Missed" items={missed} />
      </div>
    </AppShell>
  )
}
