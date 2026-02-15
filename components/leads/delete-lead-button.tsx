"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteLeadAction } from "@/app/actions/leads"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteLeadButtonProps {
  leadId: string
}

export function DeleteLeadButton({ leadId }: DeleteLeadButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead? This action cannot be undone."
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const result = await deleteLeadAction(leadId)

      if (!result.success) {
        toast.error(result.message || "Failed to delete lead")
        return
      }

      toast.success("Lead deleted successfully")

      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "Deleting..." : "Delete"}
    </button>
  )
}
