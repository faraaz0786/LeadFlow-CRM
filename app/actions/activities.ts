"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"

/* ===========================
   ADD ACTIVITY
=========================== */

export async function addActivityAction(
  leadId: string,
  type: string,
  description: string
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        type,
        description,
        created_by: user.id,
      })
      .select(
        `
        *,
        user:users!lead_activities_created_by_fkey(name)
        `
      )
      .single()

    if (error) {
      console.error("ADD ACTIVITY DB ERROR:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath(`/admin/leads/${leadId}`)

    return {
      success: true,
      data,
    }
  } catch (err: any) {
    console.error("ADD ACTIVITY ACTION ERROR:", err)
    return {
      success: false,
      error: "Unexpected error occurred",
    }
  }
}

/* ===========================
   GET ACTIVITIES
=========================== */

export async function getActivities(
  leadId: string
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("lead_activities")
      .select(
        `
        *,
        user:users!lead_activities_created_by_fkey(name)
        `
      )
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("GET ACTIVITIES ERROR:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("GET ACTIVITIES ACTION ERROR:", err)
    return []
  }
}
