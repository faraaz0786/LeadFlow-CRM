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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Export All Leads
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            This will download all leads in CSV format.
          </p>
        </div>

        <Link
          href="/api/leads/export"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          Download CSV
        </Link>

      </div>
    </AppShell>
  )
}
