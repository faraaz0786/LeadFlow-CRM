import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { updateFollowupStatusAction } from "@/app/actions/followups"

export default async function RepFollowupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: followups } = await supabase
    .from("lead_followups")
    .select("id, followup_at, status, note, lead:leads(name)")
    .eq("created_by", user.id)
    .order("followup_at", { ascending: true })

  const now = new Date()

  const overdue =
    followups?.filter(
      (f) =>
        f.status === "pending" &&
        new Date(f.followup_at) < now
    ) || []

  const today =
    followups?.filter((f) => {
      const d = new Date(f.followup_at)
      return (
        f.status === "pending" &&
        d.toDateString() === now.toDateString()
      )
    }) || []

  const upcoming =
    followups?.filter(
      (f) =>
        f.status === "pending" &&
        new Date(f.followup_at) > now
    ) || []

  function Section({
    title,
    items,
  }: {
    title: string
    items: any[]
  }) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {title} ({items.length})
        </h2>

        {items.map((f) => (
          <div
            key={f.id}
            className="border rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {f.lead?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {f.note || "No note"}
                </p>
                <p className="text-xs mt-1">
                  {format(
                    new Date(f.followup_at),
                    "PP p"
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server"
                    await updateFollowupStatusAction(
                      f.id,
                      "done"
                    )
                  }}
                >
                  <button className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg">
                    Done
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server"
                    await updateFollowupStatusAction(
                      f.id,
                      "missed"
                    )
                  }}
                >
                  <button className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg">
                    Missed
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="Follow-ups"
      pageSubtitle="Your scheduled actions"
    >
      <div className="space-y-10">
        <Section title="Overdue" items={overdue} />
        <Section title="Today" items={today} />
        <Section title="Upcoming" items={upcoming} />
      </div>
    </AppShell>
  )
}
