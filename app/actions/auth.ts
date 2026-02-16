"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { LoginInput, SignupInput } from "@/types/schema"

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
   SIGNUP
======================================================= */
export async function signup(data: SignupInput) {
  const supabase = await createClient()

  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
      },
    })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: "Signup failed." }

  const { error: dbError } = await supabase.from("users").insert({
    id: authData.user.id,
    name: data.name,
    email: data.email,
    role: "rep",
  })

  if (dbError)
    return { error: "Failed to create user profile." }

  revalidatePath("/", "layout")
  redirect("/rep/dashboard")
}

/* =======================================================
   LOGOUT
======================================================= */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies()

  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.startsWith("sb-")) {
      cookieStore.delete(cookie.name)
    }
  })

  revalidatePath("/", "layout")
  redirect("/login")
}

/* =======================================================
   UPDATE PASSWORD (After Reset Link)
======================================================= */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) return { error: error.message }

  redirect("/login")
}
