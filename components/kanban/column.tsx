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
            className={`flex flex-col w-[320px] min-w-[320px] rounded-2xl border transition-all duration-200 ${isOver
                    ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700 shadow-lg"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
        >
            {/* Column Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 rounded-t-2xl">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {stage.name}
                    </h3>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        {leads.length}
                    </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ₹ {totalValue.toLocaleString()}
                </p>
            </div>

            {/* Cards Container */}
            <div className="flex flex-1 flex-col gap-3 p-4 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
                {leads.map((lead) => (
                    <Card key={lead.id} lead={lead} />
                ))}

                {leads.length === 0 && (
                    <div className="flex h-32 items-center justify-center text-sm text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    )
}
