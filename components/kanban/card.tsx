"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import {
  Building2,
  IndianRupee,
  User,
  ExternalLink,
} from "lucide-react"

interface CardProps {
  lead: any
}

export function Card({ lead }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const score = lead.ai_score ?? 0

  const scoreColor =
    score >= 80
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : score >= 50
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative rounded-xl border bg-white dark:bg-slate-800 p-4 shadow-sm transition-all cursor-grab active:cursor-grabbing",
        isDragging &&
          "opacity-50 ring-2 ring-indigo-500 shadow-xl scale-105"
      )}
    >
      <div className="space-y-3 pointer-events-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
            {lead.name}
          </h4>

          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              scoreColor
            )}
          >
            {score}
          </span>
        </div>

        {/* Company */}
        {lead.company && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        {/* Followup Badge */}
        {lead.next_followup && (
          <div>
            {(() => {
              const date = new Date(
                lead.next_followup.followup_at
              )
              const now = new Date()

              let badgeClass =
                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"

              if (date < now) {
                badgeClass =
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              } else if (
                date.toDateString() === now.toDateString()
              ) {
                badgeClass =
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }

              return (
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${badgeClass}`}
                >
                  {date.toLocaleDateString()}
                </span>
              )
            })()}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-3.5 h-3.5" />
            {lead.expected_value
              ? lead.expected_value.toLocaleString()
              : "0"}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[90px]">
                {lead.assigned_rep?.name ||
                  "Unassigned"}
              </span>
            </div>

            <Link
              href={`/admin/leads/${lead.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
