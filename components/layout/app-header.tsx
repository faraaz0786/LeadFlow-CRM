"use client"

import { useEffect, useState } from "react"
import { Bell, Moon, Search, Sun, User } from "lucide-react"

interface AppHeaderProps {
    title: string
    subtitle?: string
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
    const [theme, setTheme] = useState<"light" | "dark">("light")
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme")
        const nextTheme: "light" | "dark" =
            savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light"

        document.documentElement.classList.toggle("dark", nextTheme === "dark")
        setTheme(nextTheme)
        setIsHydrated(true)
    }, [])

    const toggleTheme = () => {
        const nextTheme: "light" | "dark" = theme === "dark" ? "light" : "dark"

        setTheme(nextTheme)
        document.documentElement.classList.toggle("dark", nextTheme === "dark")
        localStorage.setItem("theme", nextTheme)
    }

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-8 py-4">
                {/* Title Section */}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        {!isHydrated || theme === "light" ? (
                            <Sun className="w-4 h-4 text-slate-600" />
                        ) : (
                            <Moon className="w-4 h-4 text-slate-600" />
                        )}
                    </button>

                    {/* Search Bar */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 w-64 rounded-md bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-md text-slate-500 hover:text-blue-600 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Avatar */}
                    <button className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-500 hover:text-blue-600 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    )
}
