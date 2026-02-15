import { Metadata } from "next"
import { getLeads } from "@/lib/data"
import { AppShell } from "@/components/layout/app-shell"
import { LeadsTable } from "@/components/leads/leads-table"

export const metadata: Metadata = {
  title: "Leads | LeadFlow CRM",
  description: "Manage your leads",
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    stage?: string
    rep?: string
    source?: string
  }>
}) {
  const params = await searchParams

  const leads = await getLeads({
    search: params.search,
    stage: params.stage,
    rep: params.rep,
    source: params.source,
  })

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Leads"
      pageSubtitle="Manage and track all your leads"
    >
      <LeadsTable
        leads={leads}
        newLeadHref="/admin/leads/new"
        baseEditLeadHref="/admin/leads"
      />
    </AppShell>
  )
}
