import { Metadata } from "next"
import { AppShell } from "@/components/layout/app-shell"
import { AdminDashboardClient } from "@/components/dashboard/admin-dashboard-client"
import { getDashboardStats } from "@/lib/data"

export const metadata: Metadata = {
  title: "Admin Dashboard | LeadFlow CRM",
  description: "CRM system overview",
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const totalLeads = stats.totalLeads
  const totalValue = stats.totalValue
  const wonRevenue = stats.wonRevenue
  const conversionRate = stats.conversionRate
  const averageScore = stats.averageScore
  const overdueFollowups = stats.overdueFollowups

  // Leads by stage
  const stageCounts: Record<string, number> = {}

  stats.leads.forEach((lead: any) => {
    const stageName = lead.stage?.name || "Unknown"
    stageCounts[stageName] = (stageCounts[stageName] || 0) + 1
  })

  const leadsByStage = Object.entries(stageCounts).map(
    ([name, count]) => ({
      name,
      count,
    })
  )

  // Top reps aggregation
  const repMap = new Map()

  stats.leads.forEach((lead: any) => {
    if (!lead.assigned_rep?.id) return

    const repId = lead.assigned_rep.id

    if (!repMap.has(repId)) {
      repMap.set(repId, {
        id: repId,
        name: lead.assigned_rep.name,
        total: 0,
        won: 0,
        revenue: 0,
      })
    }

    const rep = repMap.get(repId)
    rep.total += 1

    if (lead.stage?.name === "Won") {
      rep.won += 1
      rep.revenue += lead.expected_value || 0
    }
  })

  const topReps = Array.from(repMap.values())
    .map((r) => ({
      ...r,
      conversion:
        r.total > 0
          ? Math.round((r.won / r.total) * 100)
          : 0,
    }))
    .sort((a, b) => b.won - a.won)
    .slice(0, 5)

  const recentLeads = stats.leads.slice(0, 5)

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Dashboard"
      pageSubtitle="System overview and performance"
    >
      <AdminDashboardClient
        totalLeads={totalLeads}
        totalValue={totalValue}
        wonRevenue={wonRevenue}
        conversionRate={conversionRate}
        averageScore={averageScore}
        overdueFollowups={overdueFollowups}
        leadsByStage ={leadsByStage}
        topReps={topReps}
        recentLeads={recentLeads}
      />
    </AppShell>
  )
}
