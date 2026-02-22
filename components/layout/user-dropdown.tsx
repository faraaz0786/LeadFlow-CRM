"use client"

import { logout } from "@/app/actions/logout"
import { createClient } from "@/lib/supabase"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { CreditCard, Settings, User } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

interface UserDropdownProps {
  role: "admin" | "rep"
  baseHref: string
}

export function UserDropdown({ role, baseHref }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("User")
  const [email, setEmail] = useState("user@example.com")

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setEmail(user.email ?? "user@example.com")
      setName((user.user_metadata?.name as string) || "User")
    }

    loadUser()
  }, [])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [open])

  const roleBadgeClass = useMemo(
    () =>
      role === "admin"
        ? "bg-indigo-100 text-indigo-700"
        : "bg-emerald-100 text-emerald-700",
    [role]
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="User menu"
        onClick={() => setOpen((value) => !value)}
        className="h-9 w-9 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
      >
        <User className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl z-40"
          >
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center">
                  {name?.slice(0, 1).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                </div>
              </div>
              <span className={`inline-flex mt-3 rounded-full px-2 py-1 text-xs font-medium ${roleBadgeClass}`}>
                {role === "admin" ? "Admin" : "Rep"}
              </span>
            </div>

            <div className="p-2">
              <Link
                href={`${baseHref}/settings`}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <Link
                href={`${baseHref}/settings`}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
              <button
                type="button"
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </button>

              <div className="my-2 h-px bg-slate-200" />

              <form action={logout}>
                <button
                  type="submit"
                  className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
