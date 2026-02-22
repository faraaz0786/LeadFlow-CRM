import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

async function createTemplate(formData: FormData) {
  "use server"
  const supabase = await createClient()

  await supabase.from("email_templates").insert({
    name: formData.get("name"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  })

  revalidatePath("/admin/templates")
}

export default async function AdminTemplatesPage() {
  const supabase = await createClient()

  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Email Templates"
      pageSubtitle="Manage reusable email templates"
    >
      <div className="space-y-8">

        {/* CREATE TEMPLATE */}
        <form action={createTemplate} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create Template</h2>
            <p className="text-sm text-slate-500">Build reusable message templates for faster outreach.</p>
          </div>
          <input
            name="name"
            placeholder="Template Name"
            required
            className="w-full px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700"
          />
          <input
            name="subject"
            placeholder="Email Subject"
            required
            className="w-full px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700"
          />
          <textarea
            name="body"
            placeholder="Email Body"
            required
            className="w-full px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700"
          />
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Create Template
          </button>
        </form>

        {/* TEMPLATE LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Template Library</h2>
            <p className="text-sm text-slate-500">Browse and review existing templates.</p>
          </div>
          {templates?.length === 0 && (
            <p className="text-xs text-slate-500">No templates yet.</p>
          )}

          {templates?.map((t) => (
            <div key={t.id} className="border-b border-slate-200 py-4 last:border-0">
              <h3 className="text-base font-semibold text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-500">{t.subject}</p>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  )
}
