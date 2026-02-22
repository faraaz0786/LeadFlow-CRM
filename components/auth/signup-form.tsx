"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { sendSignupOtp, completeSignup } from "@/app/actions/auth"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  onSwitchLogin: () => void
}

export function SignupForm({ onSwitchLogin }: Props) {
  const [step, setStep] = useState<"form" | "verify">("form")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [password, setPassword] = useState("")

  const otpRefs = useRef<HTMLInputElement[]>([])

  /* ================= INITIAL SKELETON LOAD ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  /* ================= SEND OTP ================= */
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? p : p + 4))
    }, 80)

    const result = await sendSignupOtp(email)

    clearInterval(interval)
    setProgress(100)

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
      setProgress(0)
      return
    }

    toast.success("Verification code sent.")
    setTimeout(() => {
      setStep("verify")
      setLoading(false)
      setProgress(0)
    }, 400)
  }

  /* ================= OTP HANDLING ================= */
  function handleOtpChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  /* ================= COMPLETE SIGNUP ================= */
  async function handleCompleteSignup() {
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      toast.error("Enter valid 6-digit OTP.")
      return
    }

    if (!password) {
      toast.error("Please create password.")
      return
    }

    setLoading(true)

    const result = await completeSignup({
      email,
      token: otpCode,
      password,
      name,
    })

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md space-y-10 text-white relative"
    >
      {/* ================= PROGRESS BAR ================= */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 rounded-t-2xl overflow-hidden z-50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500"
          />
        </div>
      )}

      {/* ================= 3D SHIMMER LOADER ================= */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center rounded-2xl z-40"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-pink-500/30 border-t-pink-500 shadow-[0_0_40px_rgba(255,0,100,0.4)]"
          />
        </motion.div>
      )}

      {/* ================= SKELETON SCREEN ================= */}
      {initialLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <Skeleton className="h-14 w-72 bg-white/10" />
          <Skeleton className="h-4 w-60 bg-white/10" />

          <div className="space-y-4 pt-4">
            <Skeleton className="h-14 w-full bg-white/10 rounded-2xl" />
            <Skeleton className="h-14 w-full bg-white/10 rounded-2xl" />
          </div>

          <Skeleton className="h-14 w-full bg-white/10 rounded-2xl" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.form
              key="form"
              onSubmit={handleSendOtp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <p className="text-xs tracking-[0.35em] uppercase text-pink-500 font-semibold">
                  Global Node Registration
                </p>

                <h2 className="text-5xl font-extrabold tracking-tight leading-[1.05]">
                  Scale Up<span className="text-pink-500">.</span>
                </h2>

                <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                  Secure your node identity and unlock intelligent sales infrastructure.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Operator Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500/40 transition"
                />

                <input
                  type="email"
                  required
                  placeholder="operator@leadflow.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500/40 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 font-semibold tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-[0_15px_40px_rgba(255,0,100,0.3)]"
              >
                Send Verification Code
              </button>
            </motion.form>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-bold tracking-tight">
                  Verify Email<span className="text-pink-500">.</span>
                </h2>
                <p className="text-sm text-white/50">
                  Enter the 6-digit verification code sent to your email.
                </p>
              </div>

              <div className="flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) otpRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(e.target.value, index)
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(e, index)
                    }
                    className="w-12 h-14 text-center text-2xl font-semibold rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500/40 transition"
                  />
                ))}
              </div>

              {otp.join("").length === 6 && (
                <motion.input
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="password"
                  placeholder="Create Secure Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 px-5 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-pink-500/40 transition"
                />
              )}

              <button
                onClick={handleCompleteSignup}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 font-semibold tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-[0_15px_40px_rgba(255,0,100,0.3)]"
              >
                Complete Registration
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <p className="text-center text-sm text-white/40">
        Already active?{" "}
        <button
          type="button"
          onClick={onSwitchLogin}
          className="text-pink-500 font-medium hover:underline"
        >
          Re-Authenticate
        </button>
      </p>
    </motion.div>
  )
}