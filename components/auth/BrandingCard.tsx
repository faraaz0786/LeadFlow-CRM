"use client"

import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Sparkles } from "lucide-react"
import { useEffect, useState, memo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

type AuthMode = "login" | "signup"

interface BrandingProps {
  mode: AuthMode
  onToggle: () => void
  isLoading?: boolean
}

const ThreeDModule = dynamic(() => import("./ThreeDModule"), {
  ssr: false,
})

function BrandingCard({ mode, onToggle, isLoading }: BrandingProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  /* ✅ REAL SKELETON */
  if (isLoading) {
    return (
      <div className="w-full h-full p-10 space-y-10">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-16 w-80" />
        <Skeleton className="h-6 w-60" />
        <div className="flex justify-center mt-10">
          <Skeleton className="h-52 w-52 rounded-[2rem]" />
        </div>
        <Skeleton className="h-10 w-full mt-10" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full px-6 sm:px-8 md:px-12 pt-10 md:pt-14 pb-12 flex flex-col justify-between overflow-hidden text-white">
      {/* Background layers remain same as yours */}
      {/* ... keep your existing background code unchanged ... */}

      <div className="relative z-10 space-y-12">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3dffac] to-[#3d77ff] rounded-2xl flex items-center justify-center shadow-[0_15px_40px_rgba(61,255,172,0.4)]">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
          </div>
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Lead<span className="text-[#3dffac]">Flow</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-lg">
              {mode === "login"
                ? "Unified Sales Intelligence."
                : "Quantum Sales Velocity."}
            </h1>

            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md">
              {mode === "login"
                ? "Modules that adapt to your team's rhythm."
                : "Architect global pipelines in minutes."}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex items-center justify-center mt-12">
        {isDesktop && <ThreeDModule />}
      </div>

      <div className="relative z-10 mt-14 pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-white/30">
          Node Active
        </span>

        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <span className="text-sm font-semibold">
            {mode === "login" ? "Switch to Signup" : "Switch to Login"}
          </span>
          <ChevronRight className="w-4 h-4 text-[#3dffac]" />
        </button>
      </div>
    </div>
  )
}

export default memo(BrandingCard)