"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"
import { leadSchema } from "@/types/schema"
import { calculateLeadScore } from "@/lib/ai/lead-scoring"

export interface LeadResponse {
  success: boolean
  message?: string
  data?: any
  error?: any
}

function handleErrors(err: any): LeadResponse {
  console.error("LEAD ACTION ERROR:", err)

  return {
    success: false,
    message: err?.message || "An unexpected error occurred",
    error: err,
  }
}

/* ===========================
   CREATE LEAD
=========================== */

export async function createLeadAction(
  _: any,
  formData: FormData
): Promise<LeadResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Unauthorized" }
    }

    const rawData = Object.fromEntries(formData.entries())

    const parsed = leadSchema.safeParse({
      ...rawData,
      expected_value: Number(rawData.expected_value || 0),
      assigned_rep_id:
        rawData.assigned_rep_id && rawData.assigned_rep_id !== ""
          ? rawData.assigned_rep_id
          : null,
    })

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        error: parsed.error.format(),
      }
    }

    const scoring = calculateLeadScore({
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      source: parsed.data.source,
      status: parsed.data.status,
    })

    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        location: parsed.data.location || null,
        source: parsed.data.source || null,
        status: parsed.data.status,
        assigned_rep_id: parsed.data.assigned_rep_id || null,
        expected_value: parsed.data.expected_value,
        created_by: user.id,
        ai_score: scoring.score,
        ai_score_reason: scoring.reason,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin/leads")

    return {
      success: true,
      message: "Lead created successfully",
      data,
    }
  } catch (e) {
    return handleErrors(e)
  }
}

/* ===========================
   UPDATE LEAD
=========================== */

export async function updateLeadAction(
  leadId: string,
  _: any,
  formData: FormData
): Promise<LeadResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Unauthorized" }
    }

    const rawData = Object.fromEntries(formData.entries())

    const parsed = leadSchema.safeParse({
      ...rawData,
      expected_value: Number(rawData.expected_value || 0),
      assigned_rep_id:
        rawData.assigned_rep_id && rawData.assigned_rep_id !== ""
          ? rawData.assigned_rep_id
          : null,
    })

    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        error: parsed.error.format(),
      }
    }

    const scoring = calculateLeadScore({
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      source: parsed.data.source,
      status: parsed.data.status,
    })

    const { data, error } = await supabase
      .from("leads")
      .update({
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        location: parsed.data.location || null,
        source: parsed.data.source || null,
        status: parsed.data.status,
        assigned_rep_id: parsed.data.assigned_rep_id || null,
        expected_value: parsed.data.expected_value,
        updated_at: new Date().toISOString(),
        ai_score: scoring.score,
        ai_score_reason: scoring.reason,
      })
      .eq("id", leadId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/admin/leads")
    revalidatePath(`/admin/leads/${leadId}`)

    return {
      success: true,
      message: "Lead updated successfully",
      data,
    }
  } catch (e) {
    return handleErrors(e)
  }
}

/* ===========================
   UPDATE STATUS (PIPELINE)
=========================== */

export async function updateLeadStatusAction(
  leadId: string,
  newStageId: string
): Promise<LeadResponse> {
  try {
    const supabase = await createClient()

    /* 1️⃣ Get existing lead */
    const { data: existing, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single()

    if (fetchError || !existing) throw fetchError

    /* 2️⃣ Get stage info */
    const { data: stage } = await supabase
      .from("pipeline_stages")
      .select("name, default_probability")
      .eq("id", newStageId)
      .single()

    /* 3️⃣ Recalculate score */
    let score = 0
    const reasons: string[] = []

    if (existing.email) {
      score += 15
      reasons.push("Has email (+15)")
    }

    if (existing.phone) {
      score += 10
      reasons.push("Has phone (+10)")
    }

    if (existing.company) {
      score += 10
      reasons.push("Has company (+10)")
    }

    if (existing.source === "LinkedIn") {
      score += 15
      reasons.push("High-quality source LinkedIn (+15)")
    }

    if (stage?.default_probability) {
      score += stage.default_probability
      reasons.push(
        `Stage weight (${stage.name}) +${stage.default_probability}`
      )
    }

    if (score > 100) score = 100

    /* 4️⃣ Update lead */
    const { error } = await supabase
      .from("leads")
      .update({
        status: newStageId,
        ai_score: score,
        ai_score_reason: reasons.join(", "),
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)

    if (error) throw error

    revalidatePath("/admin/leads")
    revalidatePath("/admin/pipeline")

    return { success: true }
  } catch (e) {
    return handleErrors(e)
  }
}

/* ===========================
   DELETE LEAD
=========================== */

export async function deleteLeadAction(
  leadId: string
): Promise<LeadResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Unauthorized" }
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId)

    if (error) throw error

    revalidatePath("/admin/leads")

    return {
      success: true,
      message: "Lead deleted successfully",
    }
  } catch (e) {
    return handleErrors(e)
  }
}
