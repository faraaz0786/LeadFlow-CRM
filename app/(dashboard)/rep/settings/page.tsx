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
      <div className="space-y-8">

        <h2 className="text-base font-semibold text-slate-900">Security</h2>

        <div className="rounded-xl border border-slate-200 p-6 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200">
          <ChangePasswordForm />
        </div>

      </div>
    </AppShell>
  )
}
