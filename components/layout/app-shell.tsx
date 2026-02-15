"use client"

import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <AppSidebar role={role} baseHref={baseHref} />

            {/* Main Content */}
            <div className="ml-64">
                <AppHeader title={pageTitle} subtitle={pageSubtitle} />

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
