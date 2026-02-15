import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { Database } from "@/types/database.types"

/* ===========================
   SUPABASE CLIENT
=========================== */

async function getSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
   LEAD FILTER INTERFACE
=========================== */

export interface LeadFilters {
  search?: string
  stage?: string
  rep?: string
  source?: string
  from?: string
  to?: string
}

/* ===========================
   ENRICH FOLLOWUP INTELLIGENCE
=========================== */

function enrichLeads(data: any[]) {
  return (data || []).map((lead: any) => {
    const pending = (lead.followups || [])
      .filter((f: any) => f.status === "pending")
      .sort(
        (a: any, b: any) =>
          new Date(a.followup_at).getTime() -
          new Date(b.followup_at).getTime()
      )

    return {
      ...lead,
      next_followup: pending[0] || null,
      followups: undefined,
    }
  })
}

/* ===========================
   GET ALL LEADS (ADMIN)
=========================== */

export async function getLeads(filters?: LeadFilters) {
  const supabase = await getSupabaseClient()

  let query = supabase
    .from("leads")
    .select(`
      *,
      assigned_rep:users!leads_assigned_rep_id_fkey(id, name, email),
      stage:pipeline_stages!status(id, name, stage_order),
      followups:lead_followups!lead_followups_lead_id_fkey(
        id,
        followup_at,
        status
      )
    `)

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    )
  }

  if (filters?.stage) {
    query = query.eq("stage.name", filters.stage)
  }

  if (filters?.rep) {
    query = query.eq("assigned_rep_id", filters.rep)
  }

  if (filters?.source) {
    query = query.eq("source", filters.source)
  }

  if (filters?.from) {
    query = query.gte("created_at", filters.from)
  }

  if (filters?.to) {
    query = query.lte("created_at", filters.to)
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })

  if (error) {
    console.error("GET LEADS ERROR:", error)
    throw new Error("Failed to fetch leads")
  }

  return enrichLeads(data || [])
}

/* ===========================
   GET LEADS BY REP
=========================== */

export async function getLeadsByRep(
  repId: string,
  filters?: LeadFilters
) {
  const supabase = await getSupabaseClient()

  let query = supabase
    .from("leads")
    .select(`
      *,
      assigned_rep:users!leads_assigned_rep_id_fkey(id, name, email),
      stage:pipeline_stages!status(id, name, stage_order),
      followups:lead_followups!lead_followups_lead_id_fkey(
        id,
        followup_at,
        status
      )
    `)
    .eq("assigned_rep_id", repId)

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
    )
  }

  if (filters?.stage) {
    query = query.eq("stage.name", filters.stage)
  }

  if (filters?.source) {
    query = query.eq("source", filters.source)
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })

  if (error) {
    console.error("GET LEADS BY REP ERROR:", error)
    throw new Error("Failed to fetch rep leads")
  }

  return enrichLeads(data || [])
}

/* ===========================
   PIPELINE STAGES
=========================== */

export async function getPipelineStages() {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from("pipeline_stages")
    .select("*")
    .order("stage_order")

  if (error) {
    console.error("GET STAGES ERROR:", error)
    return []
  }

  return data || []
}

/* ===========================
   USERS (ADMIN)
=========================== */

export async function getReps() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await adminClient
    .from("users")
    .select("id, name, email")
    .eq("role", "rep")

  if (error) {
    console.error("GET REPS ERROR:", error)
    return []
  }

  return data || []
}

/* ===========================
   AUTH
=========================== */

export async function getCurrentUser() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/* ===========================
   ADMIN DASHBOARD STATS
=========================== */

export async function getDashboardStats() {
  const leads = await getLeads()

  const totalLeads = leads.length

  const totalValue = leads.reduce(
    (sum: number, lead: any) =>
      sum + (lead.expected_value || 0),
    0
  )

  const wonDeals = leads.filter(
    (lead: any) => lead.stage?.name === "Won"
  )

  const wonRevenue = wonDeals.reduce(
    (sum: number, lead: any) =>
      sum + (lead.expected_value || 0),
    0
  )

  const conversionRate =
    totalLeads > 0
      ? Math.round((wonDeals.length / totalLeads) * 100)
      : 0

  const averageScore =
    totalLeads > 0
      ? Math.round(
          leads.reduce(
            (sum: number, l: any) =>
              sum + (l.ai_score || 0),
            0
          ) / totalLeads
        )
      : 0

  const now = new Date()

  const overdueFollowups = leads.reduce(
    (count: number, lead: any) => {
      if (
        lead.next_followup &&
        lead.next_followup.status === "pending" &&
        new Date(lead.next_followup.followup_at) < now
      ) {
        return count + 1
      }
      return count
    },
    0
  )

  return {
    totalLeads,
    totalValue,
    wonRevenue,
    conversionRate,
    averageScore,
    overdueFollowups,
    leads,
  }
}

/* ===========================
   REP DASHBOARD STATS
=========================== */

export async function getRepDashboardStats() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const leads = await getLeadsByRep(user.id)

  const totalLeads = leads.length

  const pipelineValue = leads.reduce(
    (sum: number, lead: any) =>
      sum + (lead.expected_value || 0),
    0
  )

  const wonDeals = leads.filter(
    (lead: any) => lead.stage?.name === "Won"
  )

  const wonRevenue = wonDeals.reduce(
    (sum: number, lead: any) =>
      sum + (lead.expected_value || 0),
    0
  )

  const conversionRate =
    totalLeads > 0
      ? Math.round((wonDeals.length / totalLeads) * 100)
      : 0

  const stageCounts: Record<string, number> = {}

  leads.forEach((lead: any) => {
    const stageName = lead.stage?.name || "Unknown"
    stageCounts[stageName] =
      (stageCounts[stageName] || 0) + 1
  })

  const now = new Date()

  const followupsDueToday = leads.reduce(
    (count: number, lead: any) => {
      if (
        lead.next_followup &&
        lead.next_followup.status === "pending" &&
        new Date(lead.next_followup.followup_at).toDateString() ===
          now.toDateString()
      ) {
        return count + 1
      }
      return count
    },
    0
  )

  return {
    totalLeads,
    pipelineValue,
    wonRevenue,
    conversionRate,
    followupsDueToday,
    stageCounts,
    leads,
  }
}
