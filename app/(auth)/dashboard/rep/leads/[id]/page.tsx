import { RepLeadDetailsPageContent } from "@/components/leads/rep-lead-details-page"

export default async function AuthScopedRepLeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <RepLeadDetailsPageContent id={id} />
}
