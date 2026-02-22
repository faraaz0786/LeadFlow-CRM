import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getLeadsByRep, getCurrentUser, getPipelineStages } from "@/lib/data"
import { AppShell } from "@/components/layout/app-shell"
import { RepPipelineClient } from "@/components/pipeline/rep-pipeline-client"
import type { RepPipelineStage, RepPipelineLead } from "@/components/pipeline/rep-pipeline-client"

export const metadata: Metadata = {
  title: "Pipeline | LeadFlow CRM",
  description: "Manage your assigned pipeline",
}

export default async function RepPipelinePage() {
  const user = await getCurrentUser()

  if (!user) redirect("/")

  const [stages, leads] = await Promise.all([
    getPipelineStages(),
    getLeadsByRep(user.id),
  ])

  const structuredData: { stages: RepPipelineStage[] } = {
    stages: (stages ?? []).map((stage) => {
      const stageLeads = (leads ?? []).filter(
        (lead): lead is RepPipelineLead => lead.status === stage.id
      )

      const totalValue = stageLeads.reduce(
        (sum, lead) => sum + (lead.expected_value ?? 0),
        0
      )

      return {
        id: stage.id,
        name: stage.name,
        leads: stageLeads,
        count: stageLeads.length,
        totalValue,
      }
    }),
  }

  const assignedLeadsCount = leads?.length ?? 0
  const totalPipelineValue = (leads ?? []).reduce(
    (sum, lead) => sum + (lead.expected_value ?? 0),
    0
  )
  const wonStageIds = (stages ?? [])
    .filter((stage) => stage.name.toLowerCase() === "won")
    .map((stage) => stage.id)
  const wonDealsCount = (leads ?? []).filter((lead) =>
    wonStageIds.includes(lead.status ?? "")
  ).length
  const conversionRate =
    assignedLeadsCount > 0
      ? Math.round((wonDealsCount / assignedLeadsCount) * 100)
      : 0

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="My Pipeline"
      pageSubtitle="Drag and manage your assigned leads"
    >
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs text-slate-500">Assigned Leads</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {assignedLeadsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs text-slate-500">Total Pipeline Value</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            Rs {totalPipelineValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs text-slate-500">Won Deals</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {wonDealsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs text-slate-500">Conversion Rate</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {conversionRate}%
          </p>
        </div>
      </div>

      <RepPipelineClient stages={structuredData.stages} />
    </AppShell>
  )
}
