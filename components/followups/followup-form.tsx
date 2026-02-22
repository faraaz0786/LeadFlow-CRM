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

    const result = await createFollowupAction(leadId, date)

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
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
      <h3 className="text-base font-semibold text-slate-900">
        Schedule Follow-up
      </h3>

      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700"
      />

      <textarea
        placeholder="Optional note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white text-slate-700"
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
