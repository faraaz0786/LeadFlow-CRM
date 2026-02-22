"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { login } from "@/app/actions/auth"
import { Loader2, Mail, KeyRound, Fingerprint } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  onSwitchSignup: () => void
  onSwitchForgot: () => void
}

export function LoginForm({ onSwitchSignup, onSwitchForgot }: Props) {
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [loadingInitial] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await login({ email, password })

    if (result?.error) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      toast.error(result.error)
      setLoading(false)
    }
  }

  /* ===== Skeleton ===== */
  if (loadingInitial) {
    return (
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shake ? { x: [-12, 12, -8, 8, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md space-y-8 text-white relative"
    >
      {/* 3D Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl z-50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 rounded-full border border-[#3dffac]/40 border-t-[#3dffac]"
          />
        </motion.div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase text-[#3dffac] font-semibold">
          Member Node Access
        </p>

        <h2 className="text-5xl font-extrabold tracking-tight">
          Authorize<span className="text-[#3dffac]">.</span>
        </h2>

        <p className="text-white/50 text-sm">
          Session sync begins after authentication.
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-[#3dffac]" />
          <input
            name="email"
            type="email"
            required
            placeholder="operator@leadflow.net"
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-[#3dffac]/50 focus:border-[#3dffac] transition-all"
          />
        </div>

        <div className="relative group">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-[#3dffac]" />
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-[#3dffac]/50 focus:border-[#3dffac] transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSwitchForgot}
            className="text-xs text-white/40 hover:text-[#3dffac]"
          >
            Forgot Protocol?
          </button>
        </div>
      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#3dffac] to-[#3d77ff] text-black font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Establish Session
      </button>

      <button
        type="button"
        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/80 font-semibold flex items-center justify-center gap-2 hover:bg-white/10"
      >
        <Fingerprint className="w-4 h-4" />
        Use Passkey
      </button>

      <p className="text-sm text-center text-white/40">
        New to the network?{" "}
        <button
          type="button"
          onClick={onSwitchSignup}
          className="text-[#3dffac] hover:underline"
        >
          Request Access
        </button>
      </p>
    </motion.form>
  )
}