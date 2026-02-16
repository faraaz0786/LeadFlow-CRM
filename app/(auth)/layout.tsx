import { getUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (user) {
    redirect("/admin/dashboard") // or role-aware later
  }

  return <>{children}</>
}
