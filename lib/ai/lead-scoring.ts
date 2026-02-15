// lib/ai/lead-scoring.ts

export interface LeadScoringInput {
  email?: string | null
  phone?: string | null
  company?: string | null
  source?: string | null
  status?: string | null
}

export interface LeadScoreResult {
  score: number
  reason: string
}

const SOURCE_WEIGHTS: Record<string, number> = {
  linkedin: 15,
  website: 12,
  referral: 20,
  cold_call: 5,
  other: 8,
}

const STAGE_WEIGHTS: Record<string, number> = {
  new: 5,
  contacted: 10,
  qualified: 20,
  proposal: 25,
  negotiation: 30,
  won: 40,
  lost: 0,
}

export function calculateLeadScore(
  input: LeadScoringInput
): LeadScoreResult {
  let score = 0
  const reasons: string[] = []

  // Email
  if (input.email) {
    score += 15
    reasons.push("Has email (+15)")
  }

  // Phone
  if (input.phone) {
    score += 15
    reasons.push("Has phone (+15)")
  }

  // Company
  if (input.company) {
    score += 10
    reasons.push("Has company (+10)")
  }

  // Source
  if (input.source) {
    const normalized = input.source.toLowerCase()
    const sourceScore =
      SOURCE_WEIGHTS[normalized] ?? SOURCE_WEIGHTS["other"]

    score += sourceScore
    reasons.push(`Source quality (+${sourceScore})`)
  }

  // Stage
  if (input.status) {
    const normalizedStage = input.status.toLowerCase()
    const stageScore =
      STAGE_WEIGHTS[normalizedStage] ?? 0

    score += stageScore
    reasons.push(`Stage strength (+${stageScore})`)
  }

  // Cap at 100
  if (score > 100) score = 100

  return {
    score,
    reason: reasons.join(", "),
  }
}
