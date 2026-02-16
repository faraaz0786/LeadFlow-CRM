// /lib/auth/session.ts

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export type UserRole = "admin" | "rep";

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return user;
}

export async function getUserOrRedirect() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getUserRoleOrRedirect() {
  const user = await getUserOrRedirect();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    redirect("/login");
  }

  return {
    user,
    role: data.role as UserRole,
  };
}

export async function requireAdmin() {
  const { user, role } = await getUserRoleOrRedirect();

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function requireRep() {
  const { user, role } = await getUserRoleOrRedirect();

  if (role !== "rep") {
    redirect("/dashboard");
  }

  return user;
}
