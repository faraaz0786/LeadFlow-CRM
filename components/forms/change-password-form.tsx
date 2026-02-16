"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

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

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully.");
      setPassword("");
      setConfirm("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
        {loading ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}
