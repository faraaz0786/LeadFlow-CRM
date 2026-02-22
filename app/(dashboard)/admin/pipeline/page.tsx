import { Metadata } from "next"
import { getPipelineData } from "@/lib/data"
import { AppShell } from "@/components/layout/app-shell"
import { KanbanClient } from "@/components/kanban/kanban-client"

export const metadata: Metadata = {
  title: "Pipeline | LeadFlow CRM",
  description: "Manage sales pipeline",
}

export default async function PipelinePage() {
  const { leads, stages } = await getPipelineData()

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Pipeline"
      pageSubtitle="Track and manage lead stages"
    >
      <div className="space-y-8 overflow-x-hidden">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch]">
          <KanbanClient
            initialLeads={leads}
            stages={stages}
          />
        </div>
      </div>
    </AppShell>
  )
}
