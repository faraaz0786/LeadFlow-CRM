import { motion } from "framer-motion"

interface MinimalStatCardProps {
  label: string
  value: string | number
  subValue?: string
  valueBadge?: {
    text: string
    toneClassName: string
  }
}

export function MinimalStatCard({
  label,
  value,
  subValue,
  valueBadge,
}: MinimalStatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.08)] hover:shadow-[0_4px_8px_rgba(16,24,40,0.08),0_2px_4px_rgba(16,24,40,0.06)] transition-all duration-200 ease-out">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="flex items-center gap-2">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="text-2xl font-semibold text-slate-900 tracking-tight tabular-nums"
        >
          {value}
        </motion.p>
        {valueBadge ? (
          <span className={`text-xs font-medium rounded-full px-2 py-1 ${valueBadge.toneClassName}`}>
            {valueBadge.text}
          </span>
        ) : null}
      </div>
      {subValue ? <p className="text-xs text-slate-400">{subValue}</p> : null}
    </div>
  )
}
