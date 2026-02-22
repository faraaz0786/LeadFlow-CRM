"use client"

import { memo, useCallback, useState } from "react"
import {
  DndContext,
  closestCenter,
  useDroppable,
  DragEndEvent,
} from "@dnd-kit/core"
import { useVirtualizer } from "@tanstack/react-virtual"
import { updateLeadStatusAction } from "@/app/actions/leads"
import { Card } from "@/components/kanban/card"
import { useRef } from "react"

export interface RepPipelineLead {
  id: string
  name: string
  company?: string | null
  expected_value?: number | null
  assigned_rep?: { name?: string }
  stage?: { id?: string; name?: string }
  status: string
  ai_score?: number | null
  next_followup?: {
    followup_at: string | null
    status: string | null
  } | null
}

export interface RepPipelineStage {
  id: string
  name: string
  leads: RepPipelineLead[]
  count: number
  totalValue: number
}

interface Props {
  stages: RepPipelineStage[]
}

function getStageAccentClass(stage: RepPipelineStage): string {
  const palette = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-rose-500",
    "bg-cyan-500",
  ]

  const hash = stage.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return palette[hash % palette.length]
}

function recalculateStageMetrics(stage: RepPipelineStage): RepPipelineStage {
  const totalValue = stage.leads.reduce(
    (sum, lead) => sum + (lead.expected_value ?? 0),
    0
  )

  return {
    ...stage,
    count: stage.leads.length,
    totalValue,
  }
}

function moveLeadBetweenStages(
  stages: RepPipelineStage[],
  leadId: string,
  targetStageId: string
): RepPipelineStage[] | null {
  const sourceIndex = stages.findIndex((stage) =>
    stage.leads.some((lead) => lead.id === leadId)
  )
  const targetIndex = stages.findIndex((stage) => stage.id === targetStageId)

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return null
  }

  const sourceStage = stages[sourceIndex]
  const targetStage = stages[targetIndex]
  const leadIndex = sourceStage.leads.findIndex((lead) => lead.id === leadId)

  if (leadIndex === -1) return null

  const nextStages = [...stages]

  const sourceLeads = [...sourceStage.leads]
  const [movedLead] = sourceLeads.splice(leadIndex, 1)

  const targetLeads = [
    ...targetStage.leads,
    {
      ...movedLead,
      status: targetStage.id,
      stage: {
        id: targetStage.id,
        name: targetStage.name,
      },
    },
  ]

  nextStages[sourceIndex] = recalculateStageMetrics({
    ...sourceStage,
    leads: sourceLeads,
  })
  nextStages[targetIndex] = recalculateStageMetrics({
    ...targetStage,
    leads: targetLeads,
  })

  return nextStages
}

const LeadCard = memo(function LeadCard({ lead }: { lead: RepPipelineLead }) {
  return <Card lead={lead} />
})

const StageLeadList = memo(function StageLeadList({
  leads,
}: {
  leads: RepPipelineLead[]
}) {
  const shouldVirtualize = leads.length > 50
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 164,
    overscan: 6,
    getItemKey: (index) => leads[index]?.id ?? index,
  })

  if (!shouldVirtualize) {
    return (
      <div className="space-y-4 mt-4 min-h-[280px]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="mt-4 min-h-[280px] max-h-[calc(100vh-300px)] overflow-y-auto pr-1 overscroll-contain"
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualItem) => {
          const lead = leads[virtualItem.index]
          if (!lead) return null

          return (
            <div
              key={lead.id}
              className="absolute left-0 top-0 w-full pb-4"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <LeadCard lead={lead} />
            </div>
          )
        })}
      </div>
    </div>
  )
})

const DroppableColumn = memo(function DroppableColumn({
  stage,
}: {
  stage: RepPipelineStage
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })
  const accentClass = getStageAccentClass(stage)

  return (
    <div
      ref={setNodeRef}
      className={[
        "rounded-xl bg-white border border-slate-200 p-6 min-h-[400px]",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        "transition-all duration-200 ease-out",
        isOver ? "ring-2 ring-blue-200 bg-blue-50/30 border-blue-200" : "",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className={`h-11 w-1 rounded-full ${accentClass}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">
              {stage.name}
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {stage.count}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-700">
            Rs {stage.totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {isOver ? (
        <div className="mb-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-3 py-2 text-xs text-blue-600">
          Drop lead here
        </div>
      ) : null}

      <StageLeadList leads={stage.leads} />
    </div>
  )
})

export function RepPipelineClient({ stages }: Props) {
  const [stageItems, setStageItems] =
    useState<RepPipelineStage[]>(stages)

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const newStageId = over.id as string

    const previousStages = stageItems
    const nextStages = moveLeadBetweenStages(previousStages, leadId, newStageId)
    if (!nextStages) return

    setStageItems(nextStages)

    const result = await updateLeadStatusAction(leadId, newStageId)
    if (!result.success) {
      setStageItems(previousStages)
    }
  }, [stageItems])

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stageItems.map((stage) => (
          <DroppableColumn
            key={stage.id}
            stage={stage}
          />
        ))}
      </div>
    </DndContext>
  )
}
