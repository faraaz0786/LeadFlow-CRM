import { SupabaseClient } from "@supabase/supabase-js"

export class BaseRepository {
  protected supabase: SupabaseClient
  protected table: string

  constructor(supabase: SupabaseClient, table: string) {
    this.supabase = supabase
    this.table = table
  }

  async getAll() {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")

    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  }

  async insert(payload: any) {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, payload: any) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq("id", id)

    if (error) throw error
    return true
  }
}
