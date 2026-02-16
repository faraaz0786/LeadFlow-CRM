// /app/(dashboard)/rep/layout.tsx

import { requireRep } from "@/lib/auth/session";

export default async function RepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRep();

  return <>{children}</>;
}
