import { Metadata } from "next"
import { AppShell } from "@/components/layout/app-shell"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Export Leads | LeadFlow CRM",
  description: "Download leads as CSV",
}

export default function AdminLeadsExportPage() {
  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Export Leads"
      pageSubtitle="Download leads data as CSV"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Export All Leads
          </h2>
          <p className="text-sm text-slate-500">
            This will download all leads in CSV format.
          </p>
        </div>

        <Link
          href="/api/leads/export"
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Download CSV
        </Link>

      </div>
    </AppShell>
  )
}
