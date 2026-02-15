"use client"

import React, { useState } from "react"
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    closestCenter,
} from "@dnd-kit/core"
import { Column } from "./column"
import { Card } from "./card"
import { updateLeadStatusAction } from "@/app/actions/leads"
import { toast } from "sonner"

interface BoardProps {
    initialLeads: any[]
    stages: any[]
}

export function KanbanBoard({ initialLeads, stages }: BoardProps) {
    const [leads, setLeads] = useState(initialLeads)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    )

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveId(null)

        const { active, over } = event
        if (!over) return

        const leadId = active.id as string
        const targetStageId =
            over.data.current?.stageId || over.id

        if (!targetStageId) return

        const currentLead = leads.find(
            (l) => l.id === leadId
        )

        if (!currentLead) return
        if (currentLead.status === targetStageId) return

        // Optimistic update
        const previous = [...leads]
        const updated = leads.map((l) =>
            l.id === leadId
                ? { ...l, status: targetStageId }
                : l
        )

        setLeads(updated)

        const result = await updateLeadStatusAction(
            leadId,
            targetStageId
        )

        if (!result.success) {
            setLeads(previous)
            toast.error("Failed to move lead")
        } else {
            toast.success("Lead moved")
        }
    }

    const activeLead = leads.find(
        (l) => l.id === activeId
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[calc(100vh-250px)]">
                {stages.map((stage) => (
                    <Column
                        key={stage.id}
                        stage={stage}
                        leads={leads.filter(
                            (l) => l.status === stage.id
                        )}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeLead ? (
                    <div className="w-[320px] opacity-95 rotate-2">
                        <Card lead={activeLead} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
