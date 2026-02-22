import { revalidatePath } from "next/cache"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { AppShell } from "@/components/layout/app-shell"
import { LeadScoreBadge } from "@/components/ui/lead-score-badge"
import { FollowupForm } from "@/components/followups/followup-form"
import { createClient } from "@/lib/supabase-server"
import { updateLeadStatusAction } from "@/app/actions/leads"

interface Stage {
  id: string
  name: string | null
}

interface LeadDetails {
  id: string
  assigned_rep_id: string | null
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  location: string | null
  source: string | null
  status: string | null
  expected_value: number | null
  ai_score: number | null
  created_at: string | null
  stage: Stage | null
}

interface Activity {
  id: string
  type: string | null
  description: string | null
  created_at: string | null
}

interface Followup {
  id: string
  followup_at: string | null
  status: string | null
  note: string | null
}

interface EmailLog {
  id: string
  subject: string | null
  sent_at: string | null
  sender: {
    name: string | null
  } | null
}

interface RawEmailLog {
  id: string
  subject: string | null
  sent_at: string | null
  sender:
    | {
        name: string | null
      }
    | {
        name: string | null
      }[]
    | null
}

function isValidUUID(value: string) {
  return /^[0-9a-fA-F-]{36}$/.test(value)
}

async function getAuthorizedRepUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "rep") return null
  return user.id
}

async function assertRepLeadOwnership(leadId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("assigned_rep_id", userId)
    .maybeSingle()

  return Boolean(data)
}

async function getLeadDetails(leadId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("leads")
    .select(`
      id,
      assigned_rep_id,
      name,
      email,
      phone,
      company,
      location,
      source,
      status,
      expected_value,
      ai_score,
      created_at,
      stage:pipeline_stages!status(id, name)
    `)
    .eq("id", leadId)
    .eq("assigned_rep_id", userId)
    .maybeSingle()

  return (data as LeadDetails | null) ?? null
}

async function getLeadActivities(leadId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("lead_activities")
    .select("id, type, description, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })

  return (data as Activity[]) ?? []
}

async function getLeadFollowups(leadId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("lead_followups")
    .select("id, followup_at, status, note")
    .eq("lead_id", leadId)
    .order("followup_at", { ascending: true })

  return (data as Followup[]) ?? []
}

async function getEmailLogs(leadId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("email_logs")
    .select(`
      id,
      subject,
      sent_at,
      sender:users!email_logs_sent_by_fkey(name)
    `)
    .eq("lead_id", leadId)
    .order("sent_at", { ascending: false })

  return ((data ?? []) as RawEmailLog[]).map((row) => {
    const senderValue = Array.isArray(row.sender) ? row.sender[0] : row.sender

    return {
      id: row.id,
      subject: row.subject ?? null,
      sent_at: row.sent_at ?? null,
      sender: senderValue
        ? {
            name: senderValue.name ?? null,
          }
        : null,
    }
  })
}

async function getWonLostStages() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pipeline_stages")
    .select("id, name")
    .in("name", ["Won", "Lost"])

  const stages = (data as Stage[]) ?? []

  return {
    wonStage: stages.find((stage) => stage.name === "Won") ?? null,
    lostStage: stages.find((stage) => stage.name === "Lost") ?? null,
  }
}

function formatDateTime(value: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return format(date, "PP p")
}

function statusBadgeClass(status: string | null) {
  if (status === "completed" || status === "done") {
    return "bg-emerald-100 text-emerald-700"
  }
  if (status === "missed") {
    return "bg-red-100 text-red-700"
  }
  return "bg-slate-100 text-slate-700"
}

export async function RepLeadDetailsPageContent({ id }: { id: string }) {
  if (!isValidUUID(id)) return notFound()

  const userId = await getAuthorizedRepUserId()
  if (!userId) return notFound()

  const [lead, activities, followups, emailLogs, { wonStage, lostStage }] =
    await Promise.all([
      getLeadDetails(id, userId),
      getLeadActivities(id),
      getLeadFollowups(id),
      getEmailLogs(id),
      getWonLostStages(),
    ])

  if (!lead || lead.assigned_rep_id !== userId) return notFound()

  const notes = activities.filter((activity) => (activity.type ?? "").toLowerCase() === "note")
  const otherActivities = activities.filter(
    (activity) => (activity.type ?? "").toLowerCase() !== "note"
  )

  const score = lead.ai_score ?? 0
  const level = score >= 80 ? "hot" : score >= 50 ? "warm" : "cold"

  async function addNoteAction(formData: FormData) {
    "use server"
    const description = String(formData.get("description") ?? "").trim()
    if (!description) return

    const repUserId = await getAuthorizedRepUserId()
    if (!repUserId) return notFound()
    const ownsLead = await assertRepLeadOwnership(id, repUserId)
    if (!ownsLead) return notFound()

    const supabase = await createClient()
    await supabase.from("lead_activities").insert({
      lead_id: id,
      type: "note",
      description,
      created_by: repUserId,
    })

    revalidatePath(`/rep/leads/${id}`)
  }

  async function addActivityAction(formData: FormData) {
    "use server"
    const type = String(formData.get("type") ?? "").trim().toLowerCase()
    const description = String(formData.get("description") ?? "").trim()
    if (!type || !description) return

    const repUserId = await getAuthorizedRepUserId()
    if (!repUserId) return notFound()
    const ownsLead = await assertRepLeadOwnership(id, repUserId)
    if (!ownsLead) return notFound()

    const supabase = await createClient()
    await supabase.from("lead_activities").insert({
      lead_id: id,
      type,
      description,
      created_by: repUserId,
    })

    revalidatePath(`/rep/leads/${id}`)
  }

  async function markOutcomeAction(formData: FormData) {
    "use server"
    const stageId = String(formData.get("stage_id") ?? "").trim()
    if (!stageId) return

    const repUserId = await getAuthorizedRepUserId()
    if (!repUserId) return notFound()
    const ownsLead = await assertRepLeadOwnership(id, repUserId)
    if (!ownsLead) return notFound()

    await updateLeadStatusAction(id, stageId)
    revalidatePath(`/rep/leads/${id}`)
    revalidatePath("/rep/dashboard")
    revalidatePath("/rep/pipeline")
  }

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle={lead.name ? `Lead: ${lead.name}` : "Lead Details"}
      pageSubtitle="View lead details and manage next actions"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Lead Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Name</p>
                  <p className="text-slate-900 font-medium">{lead.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="text-slate-900 font-medium">{lead.email ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p className="text-slate-900 font-medium">{lead.phone ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Company</p>
                  <p className="text-slate-900 font-medium">{lead.company ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="text-slate-900 font-medium">{lead.location ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Source</p>
                  <p className="text-slate-900 font-medium">{lead.source ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="text-slate-900 font-medium">{lead.stage?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Expected Value</p>
                  <p className="text-slate-900 font-medium tabular-nums">
                    ${(lead.expected_value ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="text-slate-900 font-medium">{formatDateTime(lead.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-64 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">AI Score</p>
                <div className="mt-2">
                  <LeadScoreBadge score={score} level={level} />
                </div>
              </div>

              <div className="space-y-2">
                {wonStage ? (
                  <form action={markOutcomeAction}>
                    <input type="hidden" name="stage_id" value={wonStage.id} />
                    <button className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                      Mark Won
                    </button>
                  </form>
                ) : null}
                {lostStage ? (
                  <form action={markOutcomeAction}>
                    <input type="hidden" name="stage_id" value={lostStage.id} />
                    <button className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                      Mark Lost
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Notes</h3>
            <form action={addNoteAction} className="space-y-3">
              <textarea
                name="description"
                placeholder="Add a note..."
                className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                Add Note
              </button>
            </form>

            <div className="space-y-3">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-700">{note.description ?? "-"}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDateTime(note.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No notes yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Add Follow-up</h3>
            <FollowupForm leadId={lead.id} />
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Activities</h3>
            <form action={addActivityAction} className="space-y-3">
              <select
                name="type"
                defaultValue="call"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <textarea
                name="description"
                placeholder="Log an activity..."
                className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
              <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                Add Activity
              </button>
            </form>

            <div className="space-y-3">
              {otherActivities.length > 0 ? (
                otherActivities.map((activity) => (
                  <div key={activity.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{activity.type ?? "-"}</p>
                    <p className="mt-1 text-sm text-slate-700">{activity.description ?? "-"}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDateTime(activity.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No activities yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Follow-ups</h3>
            <div className="space-y-3">
              {followups.length > 0 ? (
                followups.map((followup) => (
                  <div key={followup.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-700">{formatDateTime(followup.followup_at)}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(followup.status)}`}>
                        {followup.status ?? "pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{followup.note ?? "No note"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No follow-ups yet.</p>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Email Logs</h3>
          <div className="space-y-3">
            {emailLogs.length > 0 ? (
              emailLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-900">{log.subject ?? "(No subject)"}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{formatDateTime(log.sent_at)}</span>
                    <span className="text-slate-300">|</span>
                    <span>{log.sender?.name ?? "Unknown sender"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No email logs available.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
