"use client"

import { motion } from "framer-motion"
import { Bell, Moon, Search, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { UserDropdown } from "./user-dropdown"

interface AppShellProps {
  children: React.ReactNode
  role?: "admin" | "rep"
  baseHref: string
  pageTitle: string
  pageSubtitle?: string
}

export function AppShell({
  children,
  role = "admin",
  baseHref,
  pageTitle,
  pageSubtitle,
}: AppShellProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notificationRef.current) return
      if (!notificationRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/admin/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
      <AppSidebar role={role} baseHref={baseHref} />

      <div className="flex-1 min-w-0 ml-64 flex flex-col bg-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200">
          <div className="h-full px-6 lg:px-10 flex items-center justify-between gap-6">

            {/* Title */}
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-sm text-slate-500 truncate">
                  {pageSubtitle}
                </p>
              )}
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <label className="relative w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder="Search leads, contacts, and accounts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </label>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {mounted ? (
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  }
                  className="h-9 w-9 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="h-9 w-9 rounded-md border border-slate-200" />
              )}

              {/* Notification Bell (no unread badge) */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setOpen((value) => !value)}
                  className="h-9 w-9 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  <Bell className="h-4 w-4" />
                </button>

                <NotificationPanel open={open} />
              </div>

              <UserDropdown role={role} baseHref={baseHref} />
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 px-6 lg:px-10 py-8 bg-slate-100"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
