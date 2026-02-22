import { Metadata } from 'next'
import { getLeadsByRep, getCurrentUser } from '@/lib/data'
import { redirect } from 'next/navigation'
import { AppShell } from "@/components/layout/app-shell"
import { RepLeadsTableClient, type RepLeadRow } from "./rep-leads-table-client"

export const metadata: Metadata = {
  title: 'My Leads | LeadFlow CRM',
  description: 'Manage your assigned leads',
}

export default async function RepLeadsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const leads = await getLeadsByRep(user.id) as RepLeadRow[]

  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="My Leads"
      pageSubtitle="Manage your assigned leads"
    >
      <div className="bg-slate-100 space-y-8">
        <RepLeadsTableClient leads={leads} />
      </div>
    </AppShell>
  )
}
