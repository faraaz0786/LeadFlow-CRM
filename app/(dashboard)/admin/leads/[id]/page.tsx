import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPipelineStages, getReps } from "@/lib/data"
import { LeadForm } from "@/components/forms/lead-form"
import { ActivityList } from "@/components/activities/activity-list"
import { DeleteLeadButton } from "@/components/leads/delete-lead-button"
import { AppShell } from "@/components/layout/app-shell"
import { LeadScoreBadge } from "@/components/ui/lead-score-badge"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/* ===========================
   METADATA
=========================== */

export const metadata: Metadata = {
  title: "Edit Lead | LeadFlow CRM",
  description: "Manage lead details",
}

/* ===========================
   UUID VALIDATION
=========================== */

function isValidUUID(id: string) {
  return /^[0-9a-fA-F-]{36}$/.test(id)
}

/* ===========================
   SUPABASE CLIENT
=========================== */

async function getSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )
}

/* ===========================
   DATA FETCHERS
=========================== */

async function getLead(id: string) {
  const supabase = await getSupabase()

  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  return data
}

async function getActivities(id: string) {
  const supabase = await getSupabase()

  const { data } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })

  return data || []
}

async function getFollowups(id: string) {
  const supabase = await getSupabase()

  const { data } = await supabase
    .from("lead_followups")
    .select("*")
    .eq("lead_id", id)
    .order("followup_at", { ascending: true })

  return data || []
}

async function getEmailTemplates() {
  const supabase = await getSupabase()

  const { data } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false })

  return data || []
}

async function getEmailLogs(id: string) {
  const supabase = await getSupabase()

  const { data } = await supabase
    .from("email_logs")
    .select(`
      id,
      subject,
      sent_at,
      sender:users!email_logs_sent_by_fkey(name)
    `)
    .eq("lead_id", id)
    .order("sent_at", { ascending: false })

  return data || []
}

/* ===========================
   PAGE
=========================== */

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id

  if (!isValidUUID(id)) return notFound()

  const [lead, stages, reps, activities, followups, templates, emailLogs] =
    await Promise.all([
      getLead(id),
      getPipelineStages(),
      getReps(),
      getActivities(id),
      getFollowups(id),
      getEmailTemplates(),
      getEmailLogs(id),
    ])

  if (!lead) return notFound()

  const score = lead.ai_score ?? 0
  const level =
    score >= 80 ? "hot" :
    score >= 50 ? "warm" :
    "cold"

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle={`Edit Lead: ${lead.name}`}
      pageSubtitle="Manage lead information and track activities"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* AI SCORE */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              AI Lead Score
            </h2>

            <LeadScoreBadge score={score} level={level} />

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>

            <ul className="mt-4 space-y-1 text-sm text-slate-500">
              {lead.ai_score_reason
                ?.split(", ")
                .map((reason: string, index: number) => (
                  <li key={index}>• {reason}</li>
                ))}
            </ul>
          </div>

          {/* LEAD INFO */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Lead Information</h2>
                <p className="text-sm text-slate-500">Update lead details</p>
              </div>
              <DeleteLeadButton leadId={lead.id} />
            </div>

            <LeadForm stages={stages} reps={reps} initialData={lead} />
          </div>

          {/* (Remaining sections unchanged) */}

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-6">Activity Timeline</h2>
            <ActivityList leadId={lead.id} initialActivities={activities} />
          </div>
        </div>

      </div>
    </AppShell>
  )
}
