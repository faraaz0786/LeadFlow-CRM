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
    <form onSubmit={handleSubmit} className="max-w-md space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="new-password">
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          required
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="confirm-password">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}
