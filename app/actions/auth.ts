"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { LoginInput, SignupInput } from "@/types/schema"

export async function login(data: LoginInput) {
    const supabase = await createClient()

    const { data: authData, error } =
        await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

    if (error) {
        console.error("LOGIN ERROR:", error)
        return { error: error.message }
    }

    if (!authData.user) {
        return { error: "Login failed." }
    }

    // 🔥 Service role client (bypasses RLS)
    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: roleError } = await adminClient
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single()

    if (roleError) {
        console.error("ROLE FETCH ERROR:", roleError)
        return { error: "Failed to determine user role." }
    }

    revalidatePath("/", "layout")

    if (profile?.role === "admin") {
        redirect("/admin/dashboard")
    } else {
        redirect("/rep/dashboard")
    }
}

export async function signup(data: SignupInput) {
    const supabase = await createClient()

    const { data: authData, error: authError } =
        await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                },
            },
        })

    if (authError) {
        console.error("SIGNUP AUTH ERROR:", authError)
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Signup failed. No user created." }
    }

    const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        role: "rep",
    })

    if (dbError) {
        console.error("SIGNUP DB ERROR:", dbError)
        return {
            error: "Failed to create user profile: " + dbError.message,
        }
    }

    revalidatePath("/", "layout")
    redirect("/rep/dashboard")
}

export async function logout() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error("LOGOUT ERROR:", error)
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/auth/login")
}
