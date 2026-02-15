"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

export function AnimatedCounter({
  value,
  prefix = "",
  duration = 1.2,
}: {
  value: number
  prefix?: string
  duration?: number
}) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 80,
    damping: 20,
  })

  const display = useTransform(spring, (latest) =>
    Math.floor(latest).toLocaleString()
  )

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  return (
    <motion.span>
      {prefix}
      <motion.span>{display}</motion.span>
    </motion.span>
  )
}
