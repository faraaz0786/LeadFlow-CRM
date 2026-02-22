"use client"

import { memo, useMemo } from "react"
import { MinimalStatCard } from "./minimal-stat-card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface AdminDashboardClientProps {
  totalLeads: number
  totalValue: number
  wonRevenue: number
  conversionRate: number
  averageScore: number
  overdueFollowups: number
  leadsByStage: {
    name: string
    count: number
  }[]
  topReps: {
    id: string
    name: string
    total: number
    won: number
    revenue: number
    conversion: number
  }[]
  recentLeads: any[]
}

interface RecentLeadRow {
  id?: string
  name?: string
  stage?: {
    name?: string
  } | null
  assigned_rep?: {
    name?: string
  } | null
  expected_value?: number | null
  created_at?: string | Date | null
}

type TopRepRow = AdminDashboardClientProps["topReps"][number]

interface RecentLeadTableRow extends RecentLeadRow {
  rowKey: string
  createdDateLabel: string
}

interface StageChartTooltipProps {
  active?: boolean
  payload?: {
    value?: number | string
    payload?: {
      name?: string
    }
  }[]
}

function StageDistributionTooltip({ active, payload }: StageChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]
  const stageName = item.payload?.name ?? "Unknown"
  const count = typeof item.value === "number" || typeof item.value === "string"
    ? item.value
    : 0

  return (
    <div className="bg-white border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-md px-3 py-2 text-xs">
      <p className="text-slate-500">{stageName}</p>
      <p className="font-medium text-slate-900">{count}</p>
    </div>
  )
}

const STAGE_CHART_TOOLTIP_CONTENT = <StageDistributionTooltip />

function formatCreatedDate(value: RecentLeadRow["created_at"]): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString()
}

const StageDistributionSection = memo(function StageDistributionSection({
  leadsByStage,
}: {
  leadsByStage: AdminDashboardClientProps["leadsByStage"]
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_4px_8px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.06)] transition-all duration-200 ease-out">
      <h2 className="text-base font-semibold text-slate-900">
        Stage Distribution
      </h2>
      <div className="h-[300px] w-full">
        {leadsByStage.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsByStage}>
              <CartesianGrid
                vertical={false}
                stroke="#E5E7EB"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={STAGE_CHART_TOOLTIP_CONTENT}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
                  backgroundColor: "#FFFFFF",
                }}
              />
              <Bar
                dataKey="count"
                fill="#4F46E5"
                activeBar={{ fill: "#4338CA" }}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No data available</p>
        )}
      </div>
    </section>
  )
})

function renderTopRepTableRow(rep: TopRepRow) {
  return (
    <tr
      key={rep.id}
      className="text-sm hover:bg-slate-50 transition-colors"
    >
      <td className="px-6 py-4 text-slate-700">{rep.name}</td>
      <td className="px-6 py-4 text-slate-700 tabular-nums">{rep.total}</td>
      <td className="px-6 py-4 text-slate-700 tabular-nums">{rep.won}</td>
      <td className="px-6 py-4 text-slate-700 tabular-nums">
        \u20B9 {rep.revenue.toLocaleString()}
      </td>
      <td className="px-6 py-4 text-slate-700 tabular-nums">{rep.conversion}%</td>
    </tr>
  )
}

function renderRecentLeadTableRow(lead: RecentLeadTableRow) {
  return (
    <tr
      key={lead.rowKey}
      className="text-sm hover:bg-slate-50 transition-colors"
    >
      <td className="px-6 py-4 text-slate-700 border-b border-slate-200">
        {lead.name ?? "-"}
      </td>
      <td className="px-6 py-4 text-slate-700 border-b border-slate-200">
        {lead.stage?.name ?? "-"}
      </td>
      <td className="px-6 py-4 text-slate-700 border-b border-slate-200">
        {lead.assigned_rep?.name ?? "-"}
      </td>
      <td className="px-6 py-4 text-slate-700 tabular-nums border-b border-slate-200">
        \u20B9 {(lead.expected_value ?? 0).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-slate-700 border-b border-slate-200">
        {lead.createdDateLabel}
      </td>
    </tr>
  )
}

export function AdminDashboardClient({
  totalLeads,
  totalValue,
  wonRevenue,
  conversionRate,
  averageScore,
  overdueFollowups,
  leadsByStage,
  topReps,
  recentLeads,
}: AdminDashboardClientProps) {
  const topRepRows = useMemo(() => topReps.slice(0, 5), [topReps])
  const recentLeadRows = useMemo(
    () =>
      (recentLeads as RecentLeadRow[]).slice(0, 5).map((lead: RecentLeadRow, index: number) => ({
        ...lead,
        rowKey: lead.id ?? `${lead.name ?? "lead"}-${index}`,
        createdDateLabel: formatCreatedDate(lead.created_at),
      })),
    [recentLeads]
  )
  const topRepTableRows = useMemo(() => topRepRows.map(renderTopRepTableRow), [topRepRows])
  const recentLeadTableRows = useMemo(
    () => recentLeadRows.map(renderRecentLeadTableRow),
    [recentLeadRows]
  )
  const conversionBadgeToneClassName =
    conversionRate >= 30
      ? "bg-emerald-100 text-emerald-600"
      : conversionRate >= 15
        ? "bg-amber-100 text-amber-600"
        : "bg-red-100 text-red-600"
  const conversionBadgeText =
    conversionRate >= 30 ? "High" : conversionRate >= 15 ? "Medium" : "Low"
  const conversionValueBadge = useMemo(
    () => ({
      text: conversionBadgeText,
      toneClassName: conversionBadgeToneClassName,
    }),
    [conversionBadgeText, conversionBadgeToneClassName]
  )
  const aiScoreDotClassName =
    averageScore >= 75
      ? "bg-emerald-500"
      : averageScore >= 50
        ? "bg-blue-500"
        : "bg-red-500"

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MinimalStatCard
          label="Total Leads"
          value={totalLeads}
        />

        <MinimalStatCard
          label="Pipeline Value"
          value={`\u20B9 ${totalValue.toLocaleString()}`}
        />

        <MinimalStatCard
          label="Won Revenue"
          value={`\u20B9 ${wonRevenue.toLocaleString()}`}
        />

        <MinimalStatCard
          label="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          valueBadge={conversionValueBadge}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_4px_8px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.06)] transition-all duration-200 ease-out flex justify-between text-sm">
        <p className="text-xs text-slate-500">
          Avg AI Score:{" "}
          <span className="font-medium text-slate-900">
            <span
              className={`h-2 w-2 rounded-full inline-block mr-2 ${aiScoreDotClassName}`}
            />
            {averageScore.toFixed(1)}
          </span>
        </p>
        <p className="text-xs text-slate-500">
          Overdue Followups: <span className="font-medium text-slate-900">{overdueFollowups}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StageDistributionSection leadsByStage={leadsByStage} />

        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_4px_8px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.06)] transition-all duration-200 ease-out">
          <h2 className="text-base font-semibold text-slate-900">
            Top Reps
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Rep</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Total Leads</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Won Deals</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Revenue</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-500 font-medium">Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {topRepRows.length > 0 ? (
                  topRepTableRows
                ) : (
                  <tr>
                    <td className="text-sm text-slate-400 text-center py-8" colSpan={5}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-3 space-y-4 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_4px_8px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.06)] transition-all duration-200 ease-out">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Leads
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-medium border-b border-slate-200">Lead Name</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-medium border-b border-slate-200">Stage</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-medium border-b border-slate-200">Assigned Rep</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-medium border-b border-slate-200">Value</th>
                  <th className="sticky top-0 bg-white px-6 py-4 text-left text-xs uppercase tracking-wide text-slate-400 font-medium border-b border-slate-200">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeadRows.length > 0 ? (
                  recentLeadTableRows
                ) : (
                  <tr>
                    <td className="text-sm text-slate-500 text-center py-8" colSpan={5}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
