"use client"

import { logout } from "@/app/actions/auth"

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
      >
        Logout
      </button>
    </form>
  )
}
