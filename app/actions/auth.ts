"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase-server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { LoginInput } from "@/types/schema"

/* =======================================================
   OTP RATE LIMIT (In-memory cooldown per email)
   NOTE: In production, use Redis or DB-based throttling.
======================================================= */
const otpRequestMap = new Map<string, number>()

/* =======================================================
   LOGIN
======================================================= */
export async function login(data: LoginInput) {
  const supabase = await createClient()

  const { data: authData, error } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

  if (error) return { error: error.message }
  if (!authData.user) return { error: "Login failed." }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile, error: roleError } = await adminClient
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single()

  if (roleError || !profile)
    return { error: "Failed to determine user role." }

  revalidatePath("/", "layout")

  if (profile.role === "admin") {
    redirect("/admin/dashboard")
  } else {
    redirect("/rep/dashboard")
  }
}

/* =======================================================
   SEND OTP (STEP 1 - Triggers Confirm Email OTP)
======================================================= */
export async function sendSignupOtp(email: string) {
  const now = Date.now()
  const lastRequest = otpRequestMap.get(email)

  // 60-second cooldown per email
  if (lastRequest && now - lastRequest < 60_000) {
    return { error: "Please wait before requesting another code." }
  }

  otpRequestMap.set(email, now)

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password: "temporary-password", // Required by Supabase
  })

  if (error) return { error: error.message }

  return { success: true }
}

/* =======================================================
   VERIFY OTP + COMPLETE ACCOUNT (STEP 2)
======================================================= */
export async function completeSignup({
  email,
  token,
  password,
  name,
}: {
  email: string
  token: string
  password: string
  name: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup", // Must be "signup" for confirm email flow
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: "Invalid OTP." }

  // Set real password after verification
  const { error: passError } = await supabase.auth.updateUser({
    password,
  })

  if (passError) return { error: passError.message }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: dbError } = await adminClient.from("users").insert({
    id: data.user.id,
    name,
    email,
    role: "rep",
  })

  if (dbError) return { error: dbError.message }

  revalidatePath("/", "layout")
  redirect("/rep/dashboard")
}

/* =======================================================
   LOGOUT
======================================================= */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}