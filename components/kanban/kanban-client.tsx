"use client"

import { KanbanBoard } from "./board"

interface KanbanClientProps {
  initialLeads: any[]
  stages: any[]
}

export function KanbanClient({
  initialLeads,
  stages,
}: KanbanClientProps) {
  return (
    <KanbanBoard
      initialLeads={initialLeads}
      stages={stages}
    />
  )
}
