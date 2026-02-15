"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createFollowupAction } from "@/app/actions/followups"
import { toast } from "sonner"

export function FollowupForm({ leadId }: { leadId: string }) {
  const [date, setDate] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!date) return

    setLoading(true)

    const result = await createFollowupAction(
      leadId,
      date,
      note
    )

    if (result.success) {
      toast.success("Follow-up scheduled")
      setDate("")
      setNote("")
    } else {
      toast.error(result.error || "Failed")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3 border rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm">
      <h3 className="text-sm font-semibold">
        Schedule Follow-up
      </h3>

      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
      />

      <textarea
        placeholder="Optional note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
      />

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Follow-up"}
        </Button>
      </div>
    </div>
  )
}
