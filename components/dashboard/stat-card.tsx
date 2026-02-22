"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  gradient: string
  delay?: number
  trend?: {
    value: string
    positive?: boolean
  }
}

export function StatCard({
  label,
  value,
  icon,
  gradient,
  delay = 0,
  trend,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        p-6
        shadow-[0_1px_2px_rgba(0,0,0,0.04)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
        transition-all
        duration-300
        transition-transform
        duration-200
        hover:scale-[1.01]
      "
    >
      {/* subtle glow layer */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100
          bg-gradient-to-br ${gradient}
          blur-2xl
          transition-opacity duration-500
        `}
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`
              p-2.5 rounded-xl
              bg-gradient-to-br ${gradient}
              text-white shadow-md
            `}
          >
            {icon}
          </div>

          {trend && (
            <span
              className={`
                text-xs font-semibold px-2 py-1 rounded-full
                ${
                  trend.positive
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                }
              `}
            >
              {trend.value}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          {label}
        </p>

        <p className="text-3xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </motion.div>
  )
}
