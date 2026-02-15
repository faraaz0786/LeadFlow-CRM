import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import { Lead } from '@/types/index' // Using simplified type or exact DB type? We should stick to DB type for repo.

type LeadRow = Database['public']['Tables']['leads']['Row']
type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

export class LeadRepository extends BaseRepository<'leads'> {
    constructor(client: SupabaseClient<Database>) {
        super(client, 'leads')
    }

    async getAllWithDetails() {
        return this.supabase
            .from('leads')
            .select(`
        *,
        assigned_rep:users!assigned_rep_id(name, email),
        stage:pipeline_stages!status(name, stage_order)
      `)
            .order('created_at', { ascending: false })
    }

    async getByRepId(repId: string) {
        return this.supabase
            .from('leads')
            .select(`
        *,
        assigned_rep:users!assigned_rep_id(name, email),
        stage:pipeline_stages!status(name, stage_order)
      `)
            .eq('assigned_rep_id', repId)
            .order('created_at', { ascending: false })
    }

    async search(query: string) {
        return this.supabase
            .from('leads')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
    }
}
