import { Metadata } from "next"
import { getLeads, getPipelineStages } from "@/lib/data"
import { AdminDashboardClient } from "@/components/dashboard/admin-dashboard-client"
import { AppShell } from "@/components/layout/app-shell"

export const metadata: Metadata = {
  title: "Admin Dashboard | LeadFlow CRM",
  description: "Overview of sales performance",
}

export default async function AdminDashboardPage() {
  const [leads, stages] = await Promise.all([
    getLeads(),
    getPipelineStages(),
  ])

  /* ===========================
     KPI CALCULATIONS
  ============================ */

  const totalLeads = leads.length

  const totalValue = leads.reduce(
    (sum, lead) => sum + (lead.expected_value || 0),
    0
  )

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const leadsThisMonth = leads.filter((lead) => {
    if (!lead.created_at) return false
    const date = new Date(lead.created_at)
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  }).length

  const wonStage = stages.find(
    (s) => s.name.toLowerCase() === "won"
  )

  const wonRevenue = leads
    .filter((l) => l.status === wonStage?.id)
    .reduce(
      (sum, l) => sum + (l.expected_value || 0),
      0
    )

  /* ===========================
     STAGE DISTRIBUTION
  ============================ */

  const leadsByStage = stages.map((stage) => {
    const stageLeads = leads.filter(
      (l) => l.status === stage.id
    )

    return {
      name: stage.name,
      count: stageLeads.length,
      value: stageLeads.reduce(
        (sum, l) => sum + (l.expected_value || 0),
        0
      ),
    }
  })

  /* ===========================
     MONTHLY TREND (Last 6 Months)
  ============================ */

  const monthlyTrend = Array.from({ length: 6 }).map(
    (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))

      const month = date.getMonth()
      const year = date.getFullYear()

      const monthLeads = leads.filter((lead) => {
        if (!lead.created_at) return false
        const created = new Date(
          lead.created_at
        )
        return (
          created.getMonth() === month &&
          created.getFullYear() === year
        )
      })

      return {
        name: date.toLocaleString("default", {
          month: "short",
        }),
        leads: monthLeads.length,
      }
    }
  )

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Dashboard"
      pageSubtitle="Sales performance overview"
    >
      <AdminDashboardClient
        totalLeads={totalLeads}
        totalValue={totalValue}
        leadsThisMonth={leadsThisMonth}
        wonRevenue={wonRevenue}
        leadsByStage={leadsByStage}
        monthlyTrend={monthlyTrend}
      />
    </AppShell>
  )
}
