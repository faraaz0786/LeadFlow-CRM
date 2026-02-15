"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"

/* ============================
   CREATE FOLLOW-UP
============================ */

export async function createFollowupAction(
  leadId: string,
  dueAt: string,
  note?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("lead_followups").insert({
    lead_id: leadId,
    followup_at: dueAt,
    status: "pending",
    note: note || null,
    created_by: user.id,
  })

  if (error) {
    console.error("CREATE FOLLOWUP ERROR:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath(`/rep/leads/${leadId}`)
  revalidatePath(`/rep/followups`)
  revalidatePath(`/admin/followups`)

  return { success: true }
}

/* ============================
   UPDATE STATUS
============================ */

export async function updateFollowupStatusAction(
  followupId: string,
  status: "pending" | "done" | "missed"
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("lead_followups")
    .update({ status })
    .eq("id", followupId)

  if (error) {
    console.error("UPDATE FOLLOWUP ERROR:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/followups`)
  revalidatePath(`/rep/followups`)

  return { success: true }
}
