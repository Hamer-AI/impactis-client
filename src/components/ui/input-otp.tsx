"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentPropsWithoutRef<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      containerClassName={cn(
        "flex items-center justify-center gap-2 has-[:disabled]:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props} />
  )
}

function InputOTPSlot({
  index,
  className,
}: {
  index: number
  className?: string
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const slot = inputOTPContext.slots[index]

  return (
    <div
      className={cn(
        "relative flex h-14 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-2xl font-black text-gray-900 shadow-sm transition-colors",
        "ring-offset-white focus-within:ring-2 focus-within:ring-[#0B3D2E]/30 focus-within:ring-offset-2",
        slot.isActive && "border-[#0B3D2E]",
        className,
      )}
    >
      {slot.char}
      {slot.hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-7 w-px animate-pulse bg-gray-900" />
        </div>
      ) : null}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }

