// /lib/lead-score.ts

export interface LeadScoringInput {
    email?: string | null
    phone?: string | null
    company?: string | null
    source?: string | null
    stageName?: string | null
  }
  
  export type LeadLevel = "hot" | "warm" | "cold"
  
  export interface LeadScoreResult {
    score: number
    level: LeadLevel
    reasons: string[]
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
  }
  
  export function calculateLeadScore(
    input: LeadScoringInput
  ): LeadScoreResult {
    let score = 0
    const reasons: string[] = []
  
    const normalizedStage =
      input.stageName?.toLowerCase().trim() ?? ""
  
    // Hard rules
    if (normalizedStage === "won") {
      return {
        score: 100,
        level: "hot",
        reasons: ["Lead marked as Won"],
      }
    }
  
    if (normalizedStage === "lost") {
      return {
        score: 0,
        level: "cold",
        reasons: ["Lead marked as Lost"],
      }
    }
  
    if (input.email) {
      score += 15
      reasons.push("Has email (+15)")
    }
  
    if (input.phone) {
      score += 15
      reasons.push("Has phone (+15)")
    }
  
    if (input.company) {
      score += 10
      reasons.push("Has company (+10)")
    }
  
    if (input.source) {
      const normalizedSource =
        input.source.toLowerCase().trim()
  
      const sourceScore =
        SOURCE_WEIGHTS[normalizedSource] ??
        SOURCE_WEIGHTS["other"]
  
      score += sourceScore
      reasons.push(`Source quality (+${sourceScore})`)
    }
  
    if (normalizedStage) {
      const stageScore =
        STAGE_WEIGHTS[normalizedStage] ?? 0
  
      score += stageScore
      reasons.push(`Stage strength (+${stageScore})`)
    }
  
    if (score > 100) score = 100
  
    let level: LeadLevel = "cold"
  
    if (score >= 80) level = "hot"
    else if (score >= 50) level = "warm"
  
    return {
      score,
      level,
      reasons,
    }
  }
  