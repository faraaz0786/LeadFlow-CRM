import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase-server"
import { RepFollowupsClient, type RepFollowupItem } from "./rep-followups-client"

export default async function RepFollowupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: followups } = await supabase
    .from("lead_followups")
    .select(`
      id,
      followup_at,
      status,
      note,
      lead:leads(
        id,
        name,
        company,
        stage:pipeline_stages!status(name)
      )
    `)
    .eq("created_by", user.id)
    .order("followup_at", { ascending: true })

  const normalizedFollowups: RepFollowupItem[] = (followups ?? []).map((item: any) => {
    const leadValue = Array.isArray(item.lead) ? item.lead[0] : item.lead
    const stageValue = Array.isArray(leadValue?.stage)
      ? leadValue.stage[0]
      : leadValue?.stage

    return {
      id: item.id,
      followup_at: item.followup_at,
      status: item.status,
      note: item.note ?? null,
      lead: leadValue
        ? {
            id: leadValue.id,
            name: leadValue.name ?? null,
            company: leadValue.company ?? null,
            stage: stageValue
              ? {
                  name: stageValue.name ?? null,
                }
              : null,
          }
        : null,
    }
  })

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="Follow-ups"
      pageSubtitle="Your scheduled actions"
    >
      <RepFollowupsClient followups={normalizedFollowups} />
    </AppShell>
  )
}
