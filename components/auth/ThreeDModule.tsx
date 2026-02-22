"use client"

import { memo, useRef, useEffect, useState } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { Cpu, Shield, Zap, Target } from "lucide-react"

function ThreeDModule() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 90, damping: 25 })
  const mouseY = useSpring(y, { stiffness: 90, damping: 25 })

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [18, -18])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-18, 18])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      className="relative w-64 h-64 flex items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-52 h-52"
      >
        {/* Outer rotating halo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-12%] border border-[#3dffac]/10 rounded-[3rem]"
        />

        {/* Glass Base */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)]" />

        {/* Core */}
        <div className="absolute inset-12 rounded-[2rem] bg-gradient-to-tr from-[#3dffac] to-[#3d77ff] shadow-[0_0_60px_rgba(61,255,172,0.4)] flex items-center justify-center">
          <Cpu size={42} className="text-black" />
        </div>

        {/* Floating Icon Satellites */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-8 left-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3"
        >
          <Shield size={18} className="text-white/70" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 -right-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3"
        >
          <Zap size={18} className="text-[#3dffac]" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute -bottom-10 right-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3"
        >
          <Target size={18} className="text-[#7000ff]" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default memo(ThreeDModule)