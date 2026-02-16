import { getUserOrRedirect } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getUserOrRedirect(); // ensures authenticated user exists

  return <>{children}</>;
}
