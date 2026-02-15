import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export class BaseRepository<T extends keyof Database['public']['Tables']> {
    table: T
    supabase: SupabaseClient<Database>

    constructor(supabase: SupabaseClient<Database>, table: T) {
        this.supabase = supabase
        this.table = table
    }

    async getAll() {
        return this.supabase.from(this.table).select('*')
    }

    async getById(id: string) {
        // Cast column name to satisfy TS check for generic table T
        return this.supabase.from(this.table).select('*').eq('id' as any, id).single()
    }

    // Use generic types that are slightly looser but compatible
    async create(data: any) {
        return this.supabase.from(this.table).insert(data).select().single()
    }

    async update(id: string, data: any) {
        // Cast column name
        return this.supabase.from(this.table).update(data).eq('id' as any, id).select().single()
    }

    async delete(id: string) {
        // Cast column name
        return this.supabase.from(this.table).delete().eq('id' as any, id)
    }
}
