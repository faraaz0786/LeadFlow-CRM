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
        <div className="bg-slate-100 min-h-screen px-8 py-10">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="mb-8">
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Add New Lead</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and assign a new lead</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow duration-200 p-6">
                    <LeadForm stages={stages} reps={reps} />
                </div>
            </div>
        </div>
    )
}
