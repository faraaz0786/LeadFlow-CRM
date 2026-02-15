/**
 * Calculate Lead Score based on PRD logic.
 * 
 * | Condition | Points |
 * | --- | --- |
 * | Has Email | +20 |
 * | Has Phone | +20 |
 * | Has Company | +20 |
 * | High quality source | +20 | (LinkedIn, Referral)
 * | Advanced stage | +20 | (Proposal, Negotiation, Closed Won)
 */

interface LeadScoreProps {
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    source?: string | null;
    stageName?: string | null;
}

export function calculateLeadScore(lead: LeadScoreProps): number {
    let score = 0;

    if (lead.email) score += 20;
    if (lead.phone) score += 20;
    if (lead.company) score += 20;

    const highQualitySources = ['LinkedIn', 'Referral', 'linkedin', 'referral', 'Direct'];
    if (lead.source && highQualitySources.some(s => lead.source!.toLowerCase().includes(s.toLowerCase()))) {
        score += 20;
    }

    const advancedStages = ['Proposal Sent', 'Negotiation', 'Closed Won'];
    if (lead.stageName && advancedStages.includes(lead.stageName)) {
        score += 20;
    }

    return Math.min(score, 100);
}
