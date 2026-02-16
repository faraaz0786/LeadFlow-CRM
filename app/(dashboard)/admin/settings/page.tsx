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
      <div className="grid gap-10">

        {/* ===========================
           PIPELINE STAGES SECTION
        ============================ */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Pipeline Stages</h2>

          <form
            action={createStage}
            className="rounded-2xl border p-6 space-y-4 bg-white dark:bg-slate-900"
          >
            <input
              name="name"
              placeholder="Stage Name"
              required
              className="w-full px-4 py-2 rounded-xl border"
            />
            <input
              name="order"
              type="number"
              placeholder="Stage Order"
              required
              className="w-full px-4 py-2 rounded-xl border"
            />
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white">
              Add Stage
            </button>
          </form>

          <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900">
            {stages?.map((s) => (
              <div key={s.id} className="border-b py-4 last:border-none">
                <p className="font-medium">
                  {s.stage_order}. {s.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===========================
           PASSWORD SECTION
        ============================ */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Security</h2>

          <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900">
            <ChangePasswordForm />
          </div>
        </div>

      </div>
    </AppShell>
  )
}
