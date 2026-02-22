import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/lib/supabase-server"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, role")
    .order("created_at", { ascending: false })

  return (
    <AppShell
      role="admin"
      baseHref="/admin"
      pageTitle="Users"
      pageSubtitle="Manage sales representatives"
    >
      <div className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Team Directory</h2>
            <p className="text-sm text-slate-500">View and manage all CRM users and roles.</p>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-4">Name</th>
                <th className="py-4">Email</th>
                <th className="py-4">Role</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {users?.map((user) => (
                <tr key={user.id} className="text-sm text-slate-700 hover:bg-slate-50">
                  <td className="py-4 font-medium">{user.name}</td>
                  <td className="py-4">{user.email}</td>
                  <td>
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-600">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
