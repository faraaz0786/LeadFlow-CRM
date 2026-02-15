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
      <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm">
        <table className="w-full">
          <thead className="text-left text-xs uppercase text-slate-500 border-b">
            <tr>
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="py-4 font-medium">{user.name}</td>
                <td className="text-slate-500">{user.email}</td>
                <td>
                  <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
