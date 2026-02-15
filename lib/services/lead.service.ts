import { createClient } from '@/lib/supabase-server'
import { LeadInput } from '@/types/schema'
import { Database } from '@/types/database.types'

type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

async function getSupabase() {
  return await createClient()
}

export class LeadService {
  /* ===========================
     GET ALL LEADS (Admin)
  =========================== */
  async getAllLeads() {
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_rep:users!leads_assigned_rep_id_fkey(id, name, email),
        stage:pipeline_stages!status(id, name, stage_order)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET ALL LEADS ERROR:', error)
      throw new Error('Failed to fetch leads')
    }

    return data ?? []
  }

  /* ===========================
     GET LEADS BY REP
  =========================== */
  async getLeadsByRep(repId: string) {
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        stage:pipeline_stages!status(id, name, stage_order)
      `)
      .eq('assigned_rep_id', repId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET LEADS BY REP ERROR:', error)
      throw new Error('Failed to fetch rep leads')
    }

    return data ?? []
  }

  /* ===========================
     CREATE LEAD
  =========================== */
  async createLead(data: LeadInput) {
    const supabase = await getSupabase()

    const insertData: LeadInsert = {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      location: data.location ?? null,
      source: data.source ?? null,
      status: data.status,
      assigned_rep_id: data.assigned_rep_id ?? null,
      expected_value: data.expected_value ?? 0,
    }

    const { data: result, error } = await supabase
      .from('leads')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('CREATE LEAD ERROR:', error)
      throw new Error('Failed to create lead')
    }

    return result
  }

  /* ===========================
     UPDATE LEAD
  =========================== */
  async updateLead(id: string, data: Partial<LeadInput>) {
    const supabase = await getSupabase()

    const updateData: LeadUpdate = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    const { data: result, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('UPDATE LEAD ERROR:', error)
      throw new Error('Failed to update lead')
    }

    return result
  }

  /* ===========================
     UPDATE STATUS
  =========================== */
  async updateStatus(id: string, newStageId: string) {
    const supabase = await getSupabase()

    const { data: result, error } = await supabase
      .from('leads')
      .update({
        status: newStageId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('UPDATE STATUS ERROR:', error)
      throw new Error('Failed to update status')
    }

    return result
  }

  /* ===========================
     DELETE LEAD
  =========================== */
  async deleteLead(id: string) {
    const supabase = await getSupabase()

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('DELETE LEAD ERROR:', error)
      throw new Error('Failed to delete lead')
    }

    return { success: true }
  }
}
