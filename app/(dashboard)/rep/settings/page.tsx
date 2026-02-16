import { AppShell } from "@/components/layout/app-shell"
import { ChangePasswordForm } from "@/components/forms/change-password-form"

export default function RepSettingsPage() {
  return (
    <AppShell
      role="rep"
      baseHref="/rep"
      pageTitle="Settings"
      pageSubtitle="Manage your account settings"
    >
      <div className="space-y-6">

        <h2 className="text-xl font-semibold">Security</h2>

        <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900">
          <ChangePasswordForm />
        </div>

      </div>
    </AppShell>
  )
}
