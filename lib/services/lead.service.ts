import { LeadRepository } from '@/lib/repositories/lead.repository'
import { createClient } from '@/lib/supabase-server'
import { LeadInput } from '@/types/schema'
import { calculateLeadScore } from '@/lib/lead-score'
import { Database } from '@/types/database.types'

// Helper to get Repo
async function getRepo() {
    const supabase = await createClient()
    return new LeadRepository(supabase)
}

export class LeadService {
    async getAllLeads() {
        const repo = await getRepo()
        return await repo.getAllWithDetails()
    }

    async getLeadsByRep(repId: string) {
        const repo = await getRepo()
        return await repo.getByRepId(repId)
    }

    async createLead(data: LeadInput) {
        const repo = await getRepo()

        // Calculate initial score (Optional enhancement from PRD)
        // We don't have a 'score' column in the strict schema provided in TDD 3.2.
        // However, PRD 4.2.1 mentions "Lead Score".
        // TDD 3.2 DOES NOT include 'score' in `leads` table.
        // TDD 6.1 says "Pure client-side calculation... Store score dynamically or compute on render."
        // So we do NOT save it to DB. We just compute it when needed.
        // Wait, if we want to sort by score, we might need it in DB.
        // But adhering strictly to TDD schema: "score" is NOT in the table.
        // I will NOT add it to the insert.

        // TDD says "status" is a UUID (FK). The input `data` likely has the stage ID.

        return await repo.create({
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            location: data.location || null,
            source: data.source || null,
            status: data.status, // ID of the stage
            assigned_rep_id: data.assigned_rep_id || null,
            expected_value: data.expected_value || 0,
            // created_at is auto
        })
    }

    async updateLead(id: string, data: Partial<LeadInput>) {
        const repo = await getRepo()

        // Prepare update object, filtering undefined
        const updateData: Database['public']['Tables']['leads']['Update'] = {
            ...data,
            updated_at: new Date().toISOString()
        }

        return await repo.update(id, updateData)
    }

    async updateStatus(id: string, newStageId: string) {
        const repo = await getRepo()
        return await repo.update(id, {
            status: newStageId,
            updated_at: new Date().toISOString()
        })
    }

    async deleteLead(id: string) {
        const repo = await getRepo()
        return await repo.delete(id)
    }
}
