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

function getScoreColor(score: number) {
  if (score >= 75) return "bg-emerald-100 text-emerald-700"
  if (score >= 50) return "bg-amber-100 text-amber-700"
  return "bg-red-100 text-red-700"
}

function getFollowupStatus(lead: any) {
  if (!lead.next_followup) return null
  if (lead.next_followup.status !== "pending") return null

  const followupDate = new Date(lead.next_followup.followup_at)
  const now = new Date()

  if (followupDate < now) {
    return {
      type: "overdue",
      className: "bg-red-100 text-red-700",
    }
  }

  if (followupDate.toDateString() === now.toDateString()) {
    return {
      type: "today",
      className: "bg-amber-100 text-amber-700",
    }
  }

  return {
    type: "upcoming",
    className: "bg-blue-100 text-blue-700",
  }
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
  const scoreColor = getScoreColor(score)

  const followupStatus = getFollowupStatus(lead)
  const isOverdue = followupStatus?.type === "overdue"

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm cursor-pointer",
        "transition-all duration-200 ease-out transform-gpu will-change-transform",
        "hover:shadow-md hover:-translate-y-0.5",
        isDragging &&
          "opacity-50 ring-2 ring-blue-500 shadow-xl rotate-[2deg] scale-[1.02]",
        isOverdue &&
          "border-red-300"
      )}
    >
      <div className="space-y-3 pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-slate-900 line-clamp-1">
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

        {lead.company && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{lead.company}</span>
          </div>
        )}

        {followupStatus && (
          <div>
            <span
              className={cn(
                "px-2 py-1 text-xs rounded-full font-medium",
                followupStatus.className
              )}
            >
              {new Date(
                lead.next_followup.followup_at
              ).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <IndianRupee className="w-3.5 h-3.5" />
            {lead.expected_value
              ? lead.expected_value.toLocaleString()
              : "0"}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[90px]">
                {lead.assigned_rep?.name || "Unassigned"}
              </span>
            </div>

            <Link
              href={`/admin/leads/${lead.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>

        {isOverdue && (
          <div className="absolute -top-2 -right-2 pointer-events-none">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white">
              Overdue
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
