"use client"

import { cn } from "@/lib/utils"
import { AtSign, Bell, Briefcase, CheckCircle2 } from "lucide-react"

export interface NotificationRecord {
  id: string
  title: string
  message: string
  type: "mentions" | "tasks" | "leads" | "general"
  is_read: boolean
  created_at: string
  action_url?: string | null
}

interface NotificationItemProps {
  notification: NotificationRecord
  timeAgo: string
  onOpen: (notification: NotificationRecord) => void
  onDismiss: (id: string) => void
}

function getTypeStyle(type: NotificationRecord["type"]) {
  switch (type) {
    case "mentions":
      return {
        wrapClass: "bg-indigo-100 text-indigo-600",
        icon: AtSign,
        actionLabel: "View Mention",
      }
    case "tasks":
      return {
        wrapClass: "bg-emerald-100 text-emerald-600",
        icon: CheckCircle2,
        actionLabel: "Go To Task",
      }
    case "leads":
      return {
        wrapClass: "bg-blue-100 text-blue-600",
        icon: Briefcase,
        actionLabel: "View Lead",
      }
    default:
      return {
        wrapClass: "bg-slate-100 text-slate-600",
        icon: Bell,
        actionLabel: "View",
      }
  }
}

export function NotificationItem({
  notification,
  timeAgo,
  onOpen,
  onDismiss,
}: NotificationItemProps) {
  const typeStyle = getTypeStyle(notification.type)
  const TypeIcon = typeStyle.icon

  return (
    <div className="border-b border-slate-100">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(notification)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onOpen(notification)
          }
        }}
        className="flex gap-3 p-4 hover:bg-slate-50 cursor-pointer"
      >
        <div className={cn("h-9 w-9 rounded-full flex items-center justify-center", typeStyle.wrapClass)}>
          <TypeIcon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 truncate">{notification.title}</p>
          <p className="text-sm text-slate-500 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-slate-400 mt-1">{timeAgo}</p>
        </div>

        <div className="flex items-start">
          {!notification.is_read ? (
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpen(notification)}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {typeStyle.actionLabel}
        </button>
        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
