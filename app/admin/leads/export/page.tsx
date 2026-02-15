import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search")
  const stage = searchParams.get("stage")
  const rep = searchParams.get("rep")
  const source = searchParams.get("source")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabase.from("leads").select("*")

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`
    )
  }

  if (stage) query = query.eq("status", stage)
  if (rep) query = query.eq("assigned_rep_id", rep)
  if (source) query = query.eq("source", source)
  if (from) query = query.gte("created_at", from)
  if (to) query = query.lte("created_at", to)

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Location",
    "Source",
    "Stage",
    "Expected Value",
    "AI Score",
    "Created At",
  ]

  const rows =
    data?.map((l: any) => [
      l.name,
      l.email ?? "",
      l.phone ?? "",
      l.company ?? "",
      l.location ?? "",
      l.source ?? "",
      l.status ?? "",
      l.expected_value ?? 0,
      l.ai_score ?? 0,
      l.created_at ?? "",
    ]) ?? []

  const csv =
    [headers, ...rows]
      .map((row) =>
        row
          .map((field: string) =>
            `"${String(field).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition":
        'attachment; filename="leads.csv"',
    },
  })
}
