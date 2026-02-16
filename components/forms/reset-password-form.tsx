"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Validate only if coming from Supabase recovery link
  useEffect(() => {
    async function validateRecovery() {
      const hash = window.location.hash;

      // Only validate if Supabase recovery token exists
      if (!hash.includes("type=recovery")) {
        return;
      }

      setCheckingSession(true);

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        toast.error("Invalid or expired reset link.");
        router.replace("/login");
      }

      setCheckingSession(false);
    }

    validateRecovery();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully.");
      router.replace("/login");
    }
  }

  if (checkingSession) {
    return (
      <div className="w-[350px] text-center text-muted-foreground">
        Validating reset link...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[350px]">
      <input
        type="password"
        required
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded-md"
      />

      <input
        type="password"
        required
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full p-2 border rounded-md"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white p-2 rounded-md"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
