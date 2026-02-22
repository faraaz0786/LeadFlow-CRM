"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"

type FollowupActionResult =
  | { success: true }
  | { success: false; error: string }

/* ============================
   CREATE FOLLOW-UP
============================ */

export async function createFollowupAction(
  leadId: string,
  dueAt: string
): Promise<FollowupActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { error } = await supabase.from("lead_followups").insert({
      lead_id: leadId,
      followup_at: dueAt,
      status: "pending",
      created_by: user.id,
    })

    if (error) {
      console.error("CREATE FOLLOWUP ERROR:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/rep/dashboard")
    revalidatePath("/rep/followups")

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create follow-up"
    return { success: false, error: message }
  }
}

/* ============================
   UPDATE STATUS
============================ */

export async function updateFollowupStatusAction(
  followupId: string,
  _nextStatus?: string
): Promise<FollowupActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data, error } = await supabase
      .from("lead_followups")
      .update({ status: "completed" })
      .eq("id", followupId)
      .eq("created_by", user.id)
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("UPDATE FOLLOWUP ERROR:", error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: "Follow-up not found or access denied" }
    }

    revalidatePath("/rep/dashboard")
    revalidatePath("/rep/followups")

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update follow-up status"
    return { success: false, error: message }
  }
}
