import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { parse } from "csv-parse/sync"

interface CSVLeadRow {
  name?: string
  email?: string
  phone?: string
  company?: string
  location?: string
  source?: string
  expected_value?: string
  status?: string
}

interface ImportSummary {
  total: number
  imported: number
  skipped: number
  failed: number
  errors: string[]
}

function calculateAIScore(lead: CSVLeadRow) {
  let score = 0
  const reasons: string[] = []

  if (lead.email) {
    score += 20
    reasons.push("Has email")
  }

  if (lead.phone) {
    score += 15
    reasons.push("Has phone")
  }

  if (lead.company) {
    score += 15
    reasons.push("Has company")
  }

  if (lead.source) {
    score += 10
    reasons.push("Has source")
  }

  return {
    ai_score: Math.min(score, 100),
    ai_score_reason: reasons.join(", "),
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const csv = buffer.toString("utf-8")

    // 👇 IMPORTANT: Type the parser output
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CSVLeadRow[]

    const summary: ImportSummary = {
      total: records.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    }

    const validLeads: any[] = []

    for (const row of records) {
      try {
        if (!row.name || !row.email) {
          summary.failed++
          summary.errors.push("Missing name or email")
          continue
        }

        // Deduplicate by email
        const { data: existing } = await supabase
          .from("leads")
          .select("id")
          .eq("email", row.email)
          .maybeSingle()

        if (existing) {
          summary.skipped++
          continue
        }

        const ai = calculateAIScore(row)

        validLeads.push({
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          company: row.company || null,
          location: row.location || null,
          source: row.source || null,
          expected_value: Number(row.expected_value || 0),
          status: row.status || null,
          created_by: user.id,
          ...ai,
        })
      } catch {
        summary.failed++
        summary.errors.push("Row processing error")
      }
    }

    if (validLeads.length > 0) {
      const { error } = await supabase
        .from("leads")
        .insert(validLeads)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      summary.imported = validLeads.length
    }

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
