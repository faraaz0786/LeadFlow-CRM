"use client"

import { forwardRef, useState } from "react"
import { cn } from "@/lib/utils"

interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false)
            setHasValue(!!e.target.value)
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value)
            props.onChange?.(e)
          }}
          className={cn(
            "w-full h-14 px-4 pt-5 pb-2 rounded-xl",
            "bg-white border border-[#E4E7F2]",
            "text-[#1E1F25] placeholder-transparent",
            "outline-none transition-all duration-300",
            "focus:border-[#4A5BFF] focus:ring-4 focus:ring-[#4A5BFF]/10",
            className
          )}
        />

        <label
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none",
            focused || hasValue
              ? "top-2 text-xs text-[#4A5BFF]"
              : "top-1/2 -translate-y-1/2 text-sm text-[#8B90A5]"
          )}
        >
          {label}
        </label>
      </div>
    )
  }
)

PremiumInput.displayName = "PremiumInput"
