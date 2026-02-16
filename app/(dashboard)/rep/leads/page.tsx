import { Metadata } from 'next'
import { getLeadsByRep, getCurrentUser } from '@/lib/data'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'My Leads | LeadFlow CRM',
  description: 'Manage your assigned leads',
}

export default async function RepLeadsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const leads = await getLeadsByRep(user.id)

  return (
    <div className="container py-10">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">My Leads</h1>
      </div>

      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stage</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {leads && leads.length > 0 ? (
                leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{lead.name}</td>
                    <td className="p-4 align-middle">{lead.email}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {lead.stage?.name}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">${lead.expected_value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No leads assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
