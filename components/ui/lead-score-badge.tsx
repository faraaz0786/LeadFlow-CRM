"use client"

import { cn } from "@/lib/utils"

interface Props {
  score: number
  level: "hot" | "warm" | "cold"
}

export function LeadScoreBadge({ score, level }: Props) {
  const color =
    level === "hot"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
      : level === "warm"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
      : "bg-slate-500/10 text-slate-500 border-slate-500/30"

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border",
        color
      )}
    >
      <span className="font-semibold">{score}</span>
      <span className="uppercase tracking-wide text-xs">
        {level}
      </span>
    </div>
  )
}
