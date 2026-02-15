"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core"
import { updateLeadStatusAction } from "@/app/actions/leads"
import { Card } from "@/components/kanban/card"

interface Stage {
  id: string
  name: string
}

interface Lead {
  id: string
  name: string
  expected_value?: number
  assigned_rep?: { name?: string }
  stage?: { id?: string; name?: string }
  status: string
  ai_score?: number
  next_followup?: {
    followup_at: string
    status: string
  } | null
}

interface Props {
  stages: Stage[]
  leads: Lead[]
}

/* ===========================
   DROPPABLE COLUMN
=========================== */

function DroppableColumn({
  stage,
  leads,
}: {
  stage: Stage
  leads: Lead[]
}) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  })

  const totalValue = leads.reduce(
    (sum, l) => sum + (l.expected_value || 0),
    0
  )

  return (
    <div
      ref={setNodeRef}
      className="rounded-2xl bg-slate-50 dark:bg-slate-900 border p-4 min-h-[400px]"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {stage.name}
        </h3>
        <p className="text-xs text-slate-500">
          {leads.length} leads • ₹ {totalValue.toLocaleString()}
        </p>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}

/* ===========================
   MAIN COMPONENT
=========================== */

export function RepPipelineClient({ stages, leads }: Props) {
  const [items, setItems] = useState(leads)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const newStageId = over.id as string

    // Prevent unnecessary update
    const draggedLead = items.find((l) => l.id === leadId)
    if (!draggedLead || draggedLead.status === newStageId) return

    // Optimistic UI
    setItems((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: newStageId } : l
      )
    )

    await updateLeadStatusAction(leadId, newStageId)
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stage) => {
          const stageLeads = items.filter(
            (l) => l.status === stage.id
          )

          return (
            <DroppableColumn
              key={stage.id}
              stage={stage}
              leads={stageLeads}
            />
          )
        })}
      </div>
    </DndContext>
  )
}
