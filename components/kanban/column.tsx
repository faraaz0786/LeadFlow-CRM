"use client"

import { useDroppable } from "@dnd-kit/core"
import { Card } from "./card"

interface ColumnProps {
    stage: any
    leads: any[]
}

export function Column({ stage, leads }: ColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
        data: {
            stageId: stage.id,
        },
    })

    const totalValue = leads.reduce(
        (sum, lead) => sum + (lead.expected_value || 0),
        0
    )

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col gap-4 min-w-[320px] max-w-[320px] flex-shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 transition-all duration-200 ${
                isOver ? "bg-blue-50 border-blue-300" : ""
            }`}
        >
            <div className="border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        {stage.name}
                    </h3>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {leads.length}
                        </span>
                        <p className="text-xs text-slate-500">
                            ₹ {totalValue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
                {leads.map((lead) => (
                    <Card key={lead.id} lead={lead} />
                ))}

                {leads.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg min-h-[100px] flex items-center justify-center text-xs text-slate-400 hover:bg-blue-50/50 transition-colors duration-200">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    )
}
