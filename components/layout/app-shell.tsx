"use client"

import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { logout } from "@/app/actions/logout"

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
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      
      {/* Sidebar */}
      <AppSidebar role={role} baseHref={baseHref} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          
          {/* Page Title */}
          <AppHeader title={pageTitle} subtitle={pageSubtitle} />

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            
            {/* Notification */}
            <button className="relative text-slate-600 dark:text-slate-300 hover:text-primary transition">
              🔔
            </button>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
              U
            </div>

            {/* Logout */}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition"
              >
                Logout
              </button>
            </form>

          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

      </div>
    </div>
  )
}
