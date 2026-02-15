import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getLeadsByRep, getCurrentUser, getPipelineStages } from "@/lib/data"
import { AppShell } from "@/components/layout/app-shell"
import { RepPipelineClient } from "@/components/pipeline/rep-pipeline-client"

export const metadata: Metadata = {
  title: "Pipeline | LeadFlow CRM",
  description: "Manage your assigned pipeline",
}

export default async function RepPipelinePage() {
  const user = await getCurrentUser()

  if (!user) redirect("/login")

  const [stages, leads] = await Promise.all([
    getPipelineStages(),
    getLeadsByRep(user.id),
  ])

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="My Pipeline"
      pageSubtitle="Drag and manage your assigned leads"
    >
      <RepPipelineClient stages={stages} leads={leads} />
    </AppShell>
  )
}
