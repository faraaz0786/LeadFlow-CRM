"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Layers,
    CheckCircle,
    UserCog,
    FileText,
    Settings,
} from "lucide-react"

interface NavItem {
    label: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    adminOnly?: boolean
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Leads",
        href: "/leads",
        icon: Users,
    },
    {
        label: "Pipeline",
        href: "/pipeline",
        icon: Layers,
    },
    {
        label: "Follow-ups",
        href: "/followups",
        icon: CheckCircle,
    },
    {
        label: "Users",
        href: "/users",
        icon: UserCog,
        adminOnly: true,
    },
    {
        label: "Templates",
        href: "/templates",
        icon: FileText,
        adminOnly: true,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        adminOnly: true,
    },
]

interface AppSidebarProps {
    role?: "admin" | "rep"
    baseHref: string
}

export function AppSidebar({ role = "admin", baseHref }: AppSidebarProps) {
    const pathname = usePathname()

    const filteredItems = navItems.filter(
        (item) => !item.adminOnly || role === "admin"
    )

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <Link href={baseHref} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            LeadFlow
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {role === "admin" ? "Admin Portal" : "Sales Rep"}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredItems.map((item) => {
                    const Icon = item.icon
                    const fullHref = `${baseHref}${item.href}`
                    const isActive = pathname === fullHref

                    return (
                        <Link
                            key={item.href}
                            href={fullHref}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            User
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {role === "admin" ? "Administrator" : "Sales Representative"}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
