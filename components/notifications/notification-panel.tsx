"use client"

import { createClient } from "@/lib/supabase"
import { AnimatePresence, motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { AtSign, Bell, Briefcase, CheckSquare, CircleDollarSign } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface NotificationRecord {
  id: string
  title: string | null
  message: string | null
  read: boolean | null
  created_at: string
  type: string | null
  user_id: string | null
}

interface NotificationPanelProps {
  open: boolean
  onUnreadCountChange?: (count: number) => void
}

type NotificationTab = "all" | "mentions" | "tasks" | "leads"

const tabs: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "tasks", label: "Tasks" },
  { id: "leads", label: "Leads" },
]

export function NotificationPanel({
  open,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [activeTab, setActiveTab] = useState<NotificationTab>("all")

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications
    if (activeTab === "mentions") return notifications.filter((item) => item.type === "mention")
    if (activeTab === "tasks") return notifications.filter((item) => item.type === "task")
    return notifications.filter((item) => item.type === "lead")
  }, [activeTab, notifications])

  useEffect(() => {
    onUnreadCountChange?.(unreadCount)
  }, [unreadCount, onUnreadCountChange])

  useEffect(() => {
    if (!open) return

    async function loadNotifications() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setNotifications([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(80)

      if (error) {
        setNotifications([])
      } else {
        setNotifications((data as NotificationRecord[]) ?? [])
      }

      setLoading(false)
    }

    loadNotifications()
  }, [open])

  async function markSingleRead(id: string) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    )

    await supabase.from("notifications").update({ read: true }).eq("id", id)
  }

  async function markAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute right-0 mt-4 w-[440px] bg-white border border-slate-200 rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.18)] z-50 overflow-hidden backdrop-blur-sm"
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.22 }}
        >
          <div className="px-7 py-6 border-b border-slate-100 flex justify-between items-center">
            <p className="text-lg font-semibold text-slate-900 tracking-tight">Notifications</p>
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              {unreadCount}
            </span>
          </div>

          <div className="px-7 pt-2 border-b border-slate-100">
            <div className="flex gap-6 text-sm font-medium">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "text-sm font-medium transition-colors duration-200 cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-3"
                      : "text-sm font-medium transition-colors duration-200 cursor-pointer text-slate-500 hover:text-slate-800 pb-3 border-b-2 border-transparent"
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-500" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    You're all caught up
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    No new notifications right now.
                  </p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-500">No notifications in this tab.</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const type = notification.type?.toLowerCase()
                const iconConfig =
                  type === "lead"
                    ? { wrap: "bg-blue-50 text-blue-600", Icon: Briefcase }
                    : type === "task"
                      ? { wrap: "bg-amber-50 text-amber-600", Icon: CheckSquare }
                      : type === "mention"
                        ? { wrap: "bg-purple-50 text-purple-600", Icon: AtSign }
                        : type === "deal"
                          ? { wrap: "bg-emerald-50 text-emerald-600", Icon: CircleDollarSign }
                          : { wrap: "bg-slate-100 text-slate-600", Icon: Bell }

                const isLastItem = index === filteredNotifications.length - 1

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      if (!notification.read) {
                        markSingleRead(notification.id)
                      }
                    }}
                    className={`relative px-7 py-5 flex gap-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer group hover:shadow-sm ${
                      !notification.read ? "bg-blue-50/40" : ""
                    } ${isLastItem ? "" : "border-b border-slate-100"}`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconConfig.wrap}`}
                    >
                      <iconConfig.Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {!notification.read ? (
                      <div className="absolute right-7 top-6 h-2.5 w-2.5 bg-blue-600 rounded-full ring-2 ring-white shadow-sm" />
                    ) : null}
                  </motion.div>
                )
              })
            )}
          </div>

          <div className="px-7 py-5 bg-slate-50 border-t border-slate-100 space-y-3">
            <button
              type="button"
              onClick={markAllAsRead}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl shadow-sm transition"
            >
              Mark All as Read
            </button>

            <button
              type="button"
              className="w-full text-xs text-slate-500 hover:text-slate-700 transition"
            >
              View Notification History
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
