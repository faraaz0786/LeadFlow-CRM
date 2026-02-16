import { Metadata } from 'next'
import { getLeads, getPipelineStages } from '@/lib/data'
import { KanbanBoard } from '@/components/kanban/board'
import { AppShell } from '@/components/layout/app-shell'

export const metadata: Metadata = {
  title: 'Pipeline | LeadFlow CRM',
  description: 'Manage your sales pipeline',
}

export default async function PipelinePage() {
  const leads = await getLeads()
  const stages = await getPipelineStages()

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Pipeline"
      pageSubtitle="Visualize and manage your sales pipeline"
    >
      <KanbanBoard initialLeads={leads} stages={stages} />
    </AppShell>
  )
}
