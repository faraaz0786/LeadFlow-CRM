"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Reset link sent. Check your email.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[350px]">
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded-md"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white p-2 rounded-md"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
