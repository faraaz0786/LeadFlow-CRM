"use client"

import { cn } from "@/lib/utils"

export type NotificationTab = "all" | "mentions" | "tasks" | "leads"

const tabs: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "tasks", label: "Tasks" },
  { id: "leads", label: "Leads" },
]

interface NotificationTabsProps {
  value: NotificationTab
  onChange: (tab: NotificationTab) => void
}

export function NotificationTabs({ value, onChange }: NotificationTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            value === tab.id
              ? "text-blue-600 border-blue-600"
              : "text-slate-500 border-transparent hover:text-slate-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
