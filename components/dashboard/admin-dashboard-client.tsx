"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AdminDashboardClientProps {
  totalLeads: number
  totalValue: number
  leadsThisMonth: number
  wonRevenue: number
  leadsByStage: {
    name: string
    count: number
    value: number
  }[]
  monthlyTrend: {
    name: string
    leads: number
  }[]
}

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#0EA5E9",
  "#A855F7",
]

export function AdminDashboardClient({
  totalLeads,
  totalValue,
  leadsThisMonth,
  wonRevenue,
  leadsByStage,
  monthlyTrend,
}: AdminDashboardClientProps) {
  // Prevent hydration + width(-1) issues
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const kpiData = [
    {
      label: "Total Leads",
      value: totalLeads,
      gradient: "from-indigo-500 to-violet-600",
    },
    {
      label: "Pipeline Value",
      value: `₹ ${totalValue.toLocaleString()}`,
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      label: "Leads This Month",
      value: leadsThisMonth,
      gradient: "from-emerald-500 to-green-600",
    },
    {
      label: "Won Revenue",
      value: `₹ ${wonRevenue.toLocaleString()}`,
      gradient: "from-amber-500 to-orange-600",
    },
  ]

  return (
    <div className="space-y-10">
      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300"
          >
            {/* Gradient Accent Stripe */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient}`}
            />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              {item.label}
            </p>

            <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ================= CHARTS ================= */}
      {mounted && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* MONTHLY TREND */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Leads (Last 6 Months)
            </h2>

            <div className="h-[320px] min-h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="leads"
                    radius={[8, 8, 0, 0]}
                  >
                    {monthlyTrend.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* STAGE DISTRIBUTION */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Leads by Stage
            </h2>

            <div className="h-[320px] min-h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStage}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, percent }) =>
                      `${name} ${(
                        (percent || 0) * 100
                      ).toFixed(0)}%`
                    }
                  >
                    {leadsByStage.map(
                      (_, index) => (
                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
