import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { ChangePasswordForm } from "@/components/forms/change-password-form"

async function createStage(formData: FormData) {
  "use server"
  const supabase = await createClient()

  await supabase.from("pipeline_stages").insert({
    name: formData.get("name"),
    stage_order: Number(formData.get("order")),
  })

  revalidatePath("/admin/settings")
}

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("*")
    .order("stage_order")

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Settings"
      pageSubtitle="Manage system settings"
    >
      <div className="space-y-8">

        {/* ===========================
           PIPELINE STAGES SECTION
        ============================ */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pipeline Stages</h2>
            <p className="text-sm text-slate-500">Manage the order and names of sales stages.</p>
          </div>

          <form
            action={createStage}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4"
          >
            <input
              name="name"
              placeholder="Stage Name"
              required
              className="w-full px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700"
            />
            <input
              name="order"
              type="number"
              placeholder="Stage Order"
              required
              className="w-full px-4 py-2 rounded-md border border-slate-200 text-sm text-slate-700"
            />
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Add Stage
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            {stages?.map((s) => (
              <div key={s.id} className="border-b border-slate-200 py-4 last:border-none">
                <p className="text-sm text-slate-700 font-medium">
                  {s.stage_order}. {s.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===========================
           PASSWORD SECTION
        ============================ */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)] p-8 space-y-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            <p className="text-sm text-slate-500">Update account access and password settings.</p>
          </div>

          <ChangePasswordForm />
        </div>

      </div>
    </AppShell>
  )
}
