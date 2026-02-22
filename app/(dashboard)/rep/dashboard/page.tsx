import { getRepDashboardStats } from "@/lib/data"
import { AppShell } from "@/components/layout/app-shell"

type RepStats = NonNullable<Awaited<ReturnType<typeof getRepDashboardStats>>>

function RepDashboardClient({ stats }: { stats: RepStats }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">Assigned Leads</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.totalAssignedLeads}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">Won Deals</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.wonDeals}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">Conversion Rate</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.conversionRate}%
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">Follow-ups Due Today</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.followupsDueToday}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">Overdue Follow-ups</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.overdueFollowups}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">Upcoming (Next 7 Days)</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.upcomingFollowups}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900">Leads by Stage</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.stageCounts).map(([stage, count]) => (
            <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{stage}</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function RepDashboardPage() {
  const stats = await getRepDashboardStats()

  if (!stats) {
    return (
      <AppShell
        role="rep"
        baseHref="/rep"
        pageTitle="Dashboard"
        pageSubtitle="Your performance overview"
      >
        <div className="rounded-xl bg-white border border-slate-200 p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">No data available.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="Dashboard"
      pageSubtitle="Your performance overview"
    >
      <RepDashboardClient stats={stats} />
    </AppShell>
  )
}
