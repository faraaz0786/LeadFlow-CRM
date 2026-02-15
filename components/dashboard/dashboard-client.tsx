"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts"
import { motion } from "framer-motion"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface Props {
    totalLeads: number
    totalValue: number
    leadsThisMonth: number
    wonRevenue: number
    leadsByStage: { name: string; count?: number; value?: number }[]
    monthlyTrend: { name: string; leads: number }[]
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
} as const

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1] as any,
        },
    },
} as const

export function DashboardClient({
    totalLeads,
    totalValue,
    leadsThisMonth,
    wonRevenue,
    leadsByStage,
    monthlyTrend,
}: Props) {
    const kpiData = [
        {
            label: "Total Leads",
            value: totalLeads,
            color: "from-indigo-500 to-violet-600",
        },
        {
            label: "Pipeline Value",
            value: totalValue,
            prefix: "₹ ",
            color: "from-blue-500 to-cyan-600",
        },
        {
            label: "Leads This Month",
            value: leadsThisMonth,
            color: "from-emerald-500 to-green-600",
        },
        {
            label: "Won Revenue",
            value: wonRevenue,
            prefix: "₹ ",
            color: "from-amber-500 to-orange-600",
        },
    ]

    return (
        <div className="space-y-8">
            {/* KPI CARDS */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {kpiData.map((item) => (
                    <motion.div
                        key={item.label}
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300"
                    >
                        {/* Gradient accent stripe */}
                        <div
                            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color}`}
                        />

                        {/* Subtle glow effect */}
                        <div
                            className={`absolute -top-10 -right-10 h-32 w-32 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                        />

                        <div className="relative">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                                {item.label}
                            </p>

                            <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                <AnimatedCounter
                                    value={item.value}
                                    prefix={item.prefix}
                                />
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stage Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                >
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
                        Leads by Stage
                    </h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leadsByStage}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "0.75rem",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#6366f1"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Monthly Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                >
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
                        Monthly Lead Trend
                    </h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrend}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ stroke: "#6366f1", strokeWidth: 2 }}
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "0.75rem",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="leads"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{ r: 5, fill: "#6366f1" }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    )
}
