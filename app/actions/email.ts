"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function sendEmailAction(
  leadId: string,
  subject: string,
  body: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // 1️⃣ Log email
  const { error } = await supabase.from("email_logs").insert({
    lead_id: leadId,
    subject,
    body,
    sent_by: user.id,
  })

  if (error) {
    console.error("EMAIL LOG ERROR:", error)
    return { success: false, error: error.message }
  }

  // 2️⃣ Add activity entry
  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    type: "Email",
    description: `Email sent: ${subject}`,
    created_by: user.id,
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath(`/rep/leads/${leadId}`)

  return { success: true }
}
