"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import BrandingCard from "./BrandingCard"

type AuthMode = "login" | "signup"

export default function AuthLanding() {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleAuthMode = () => {
    setAuthMode(prev =>
      prev === "login" ? "signup" : "login"
    )
  }

  const formVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay: 0.15,
      },
    },
    hidden: {
      opacity: 0,
      y: 30,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 25,
      },
    },
  }

  return (
    <div className="h-screen w-full min-w-0 overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-[#05070a] overflow-x-hidden relative">

      {/* Animated Ambient Blobs */}
      <motion.div
        animate={{
          backgroundColor:
            authMode === "login"
              ? "rgba(61,255,172,0.08)"
              : "rgba(112,0,255,0.08)",
        }}
        transition={{ duration: 0.6 }}
        className="absolute top-[-10%] left-[-10%] w-[100%] h-[50%] rounded-full blur-[120px]"
      />

      <motion.div
        animate={{
          backgroundColor:
            authMode === "login"
              ? "rgba(112,0,255,0.05)"
              : "rgba(61,255,172,0.05)",
        }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] rounded-full blur-[120px]"
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Main Container */}
      <div
        className="w-full min-w-0 max-w-6xl 
                    min-h-[720px] 
                    md:h-[720px]
                    bg-[#0d1117]/60 
                    backdrop-blur-3xl 
                    rounded-[2.5rem] 
                    border border-white/5 
                    shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] 
                    relative 
                    overflow-hidden 
                    flex flex-col md:flex-row"
        style={{ contain: "layout" }}
      >

        {/* Signup */}
        <motion.div
          initial="hidden"
          animate={authMode === "signup" ? "visible" : "hidden"}
          variants={formVariants}
          className="absolute top-0 left-0 w-full h-1/2 md:w-1/2 md:h-full flex flex-col justify-center p-6 sm:p-10 md:p-20 z-10 will-change-transform"
          style={{ pointerEvents: authMode === "signup" ? "auto" : "none" }}
        >
          <SignupForm onSwitchLogin={toggleAuthMode} />
        </motion.div>

        {/* Login */}
        <motion.div
          initial="visible"
          animate={authMode === "login" ? "visible" : "hidden"}
          variants={formVariants}
          className="absolute bottom-0 right-0 w-full h-1/2 md:w-1/2 md:h-full flex flex-col justify-center p-6 sm:p-10 md:p-20 z-10 will-change-transform"
          style={{ pointerEvents: authMode === "login" ? "auto" : "none" }}
        >
          <LoginForm
            onSwitchSignup={toggleAuthMode}
            onSwitchForgot={() => {}}
          />
        </motion.div>

        {/* Sliding Branding */}
        <motion.div
          initial={false}
          animate={{
            x: isMobile
              ? "0%"
              : authMode === "login"
              ? "0%"
              : "100%",
            y: isMobile
              ? authMode === "login"
                ? "0%"
                : "100%"
              : "0%",
          }}
          transition={{
            type: "spring",
            stiffness: 45,
            damping: 15,
            mass: 0.8,
          }}
          className="absolute top-0 left-0 w-full md:w-1/2 h-1/2 md:h-full z-30 will-change-transform"
        >
          <BrandingCard
            mode={authMode}
            onToggle={toggleAuthMode}
          />
        </motion.div>

      </div>
    </div>
  )
}
