import { getPipelineStages, getReps } from '@/lib/data'
import { LeadForm } from '@/components/forms/lead-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'New Lead | LeadFlow CRM',
    description: 'Add a new lead',
}

export default async function NewLeadPage() {
    const stages = await getPipelineStages()
    const reps = await getReps()

    return (
        <div className="container py-10 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Add New Lead</h1>
            <div className="border rounded-lg p-6 bg-card">
                <LeadForm stages={stages} reps={reps} />
            </div>
        </div>
    )
}
