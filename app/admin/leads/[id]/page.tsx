import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPipelineStages, getReps } from "@/lib/data"
import { LeadForm } from "@/components/forms/lead-form"
import { ActivityList } from "@/components/activities/activity-list"
import { DeleteLeadButton } from "@/components/leads/delete-lead-button"
import { AppShell } from "@/components/layout/app-shell"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/types/database.types"

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

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
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
   SCORE COLOR
=========================== */

function getScoreColor(score: number) {
  if (score >= 75)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
  if (score >= 50)
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
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

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle={`Edit Lead: ${lead.name}`}
      pageSubtitle="Manage lead information and track activities"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI SCORE */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">AI Lead Score</h2>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getScoreColor(lead.ai_score || 0)}`}>
                {lead.ai_score ?? 0} / 100
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {lead.ai_score_reason || "No scoring explanation available."}
            </p>
          </div>

          {/* LEAD INFO */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Lead Information</h2>
                <p className="text-sm text-slate-500">Update lead details</p>
              </div>
              <DeleteLeadButton leadId={lead.id} />
            </div>

            <LeadForm stages={stages} reps={reps} initialData={lead} />
          </div>

          {/* FOLLOWUPS */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Follow-ups</h2>

            {followups.length === 0 ? (
              <p className="text-sm text-slate-500">No follow-ups scheduled.</p>
            ) : (
              <div className="space-y-4">
                {followups.map((f: any) => (
                  <div key={f.id} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm font-semibold">
                      {new Date(f.followup_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {f.note || "No note"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EMAIL SECTION */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Send Email</h2>

            <form
              action={async (formData) => {
                "use server"
                const { sendEmailAction } = await import("@/app/actions/email")

                const templateId = formData.get("template_id") as string
                let subject = formData.get("subject") as string
                let body = formData.get("body") as string

                if (templateId) {
                  const supabase = await getSupabase()
                  const { data: template } = await supabase
                    .from("email_templates")
                    .select("*")
                    .eq("id", templateId)
                    .single()

                  subject = template?.subject || subject
                  body = template?.body || body
                }

                await sendEmailAction(lead.id, subject, body)
              }}
              className="space-y-4"
            >
              <select name="template_id" className="w-full px-4 py-2 rounded-xl border">
                <option value="">Custom Email</option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                name="subject"
                placeholder="Email Subject"
                className="w-full px-4 py-2 rounded-xl border"
              />

              <textarea
                name="body"
                placeholder="Email Body"
                rows={4}
                className="w-full px-4 py-2 rounded-xl border"
              />

              <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
                Send Email
              </button>
            </form>
          </div>

          {/* EMAIL HISTORY */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Email History</h2>

            {emailLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No emails sent yet.</p>
            ) : (
              <div className="space-y-4">
                {emailLogs.map((e: any) => (
                  <div key={e.id} className="p-4 border rounded-xl">
                    <p className="font-semibold text-sm">{e.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Sent by {e.sender?.name || "Unknown"} on{" "}
                      {new Date(e.sent_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6">Activity Timeline</h2>
            <ActivityList leadId={lead.id} initialActivities={activities} />
          </div>
        </div>

      </div>
    </AppShell>
  )
}
