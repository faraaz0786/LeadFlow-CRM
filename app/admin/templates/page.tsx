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
      <div className="grid gap-8">

        {/* CREATE TEMPLATE */}
        <form action={createTemplate} className="rounded-2xl border p-6 space-y-4 bg-white dark:bg-slate-900">
          <input
            name="name"
            placeholder="Template Name"
            required
            className="w-full px-4 py-2 rounded-xl border"
          />
          <input
            name="subject"
            placeholder="Email Subject"
            required
            className="w-full px-4 py-2 rounded-xl border"
          />
          <textarea
            name="body"
            placeholder="Email Body"
            required
            className="w-full px-4 py-2 rounded-xl border"
          />
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
            Create Template
          </button>
        </form>

        {/* TEMPLATE LIST */}
        <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900">
          {templates?.length === 0 && (
            <p className="text-sm text-slate-500">No templates yet.</p>
          )}

          {templates?.map((t) => (
            <div key={t.id} className="border-b py-4">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-slate-500">{t.subject}</p>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  )
}
