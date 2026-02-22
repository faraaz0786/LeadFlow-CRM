"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import {
    LayoutDashboard,
    Users,
    Layers,
    CheckCircle,
    UserCog,
    FileText,
    Settings,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
    const [displayName, setDisplayName] = useState("User")
    const [displayRole, setDisplayRole] = useState<"admin" | "rep">(role)

    const filteredItems = navItems.filter(
        (item) => !item.adminOnly || role === "admin"
    )

    useEffect(() => {
        async function loadCurrentUser() {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            const nameFromMeta = (user.user_metadata?.name as string | undefined)?.trim()
            const fallbackEmail = user.email?.trim()
            setDisplayName(nameFromMeta || fallbackEmail || "User")

            const roleFromMeta = user.app_metadata?.role
            if (roleFromMeta === "admin" || roleFromMeta === "rep") {
                setDisplayRole(roleFromMeta)
            }
        }

        loadCurrentUser()
    }, [])

    const roleBadgeClassName = useMemo(
        () =>
            displayRole === "admin"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-emerald-100 text-emerald-700",
        [displayRole]
    )

    const avatarInitial = displayName.slice(0, 1).toUpperCase() || "U"

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
                <Link href={baseHref} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            LeadFlow
                        </h1>
                        <p className="text-xs text-slate-500">
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
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                                isActive
                                    ? "relative bg-blue-50 text-blue-600 font-medium before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-full before:bg-blue-600"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t border-slate-200 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">
                        {avatarInitial}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-slate-900 truncate">
                            {displayName}
                        </span>
                        <span className="text-xs text-slate-500">
                            {displayRole === "admin" ? "Administrator" : "Sales Rep"}
                        </span>
                    </div>
                    <span className={cn("ml-auto rounded-full px-2 py-1 text-[10px] font-medium", roleBadgeClassName)}>
                        {displayRole === "admin" ? "Admin" : "Rep"}
                    </span>
                </div>
            </div>
        </aside>
    )
}
