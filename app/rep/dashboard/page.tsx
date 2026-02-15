import { getRepDashboardStats } from "@/lib/data"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { AppShell } from "@/components/layout/app-shell"

export default async function RepDashboardPage() {
  const stats = await getRepDashboardStats()

  if (!stats) {
    return (
      <AppShell
        role="rep"
        baseHref="/rep"
        pageTitle="Dashboard"
        pageSubtitle="Your sales performance"
      >
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">No data available.</p>
        </div>
      </AppShell>
    )
  }

  /* ===========================
     STAGE DISTRIBUTION
  ============================ */

  const leadsByStage = Object.entries(stats.stageCounts).map(
    ([name, count]) => ({
      name,
      count,
      value: 0,
    })
  )

  /* ===========================
     MONTHLY TREND (Last 6 Months)
  ============================ */

  const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))

    const month = date.getMonth()
    const year = date.getFullYear()

    const monthLeads = stats.leads.filter((lead: any) => {
      if (!lead.created_at) return false
      const created = new Date(lead.created_at)
      return (
        created.getMonth() === month &&
        created.getFullYear() === year
      )
    })

    return {
      name: date.toLocaleString("default", { month: "short" }),
      leads: monthLeads.length,
    }
  })

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="Dashboard"
      pageSubtitle="Your sales performance"
    >
      <DashboardClient
        totalLeads={stats.totalLeads}
        totalValue={stats.pipelineValue}
        leadsThisMonth={stats.leadsThisMonth}
        wonRevenue={stats.wonRevenue}
        leadsByStage={leadsByStage}
        monthlyTrend={monthlyTrend}
      />
    </AppShell>
  )
}
