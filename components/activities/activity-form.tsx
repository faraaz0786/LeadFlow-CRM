"use client"

import { useState } from "react"
import { addActivityAction } from "@/app/actions/activities"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ActivityForm({
  leadId,
  onSuccess,
}: {
  leadId: string
  onSuccess: () => void
}) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!content.trim()) return

    setLoading(true)

    const result = await addActivityAction(
      leadId,
      "note",
      content
    )

    if (!result.success) {
      toast.error(result.error)
    } else {
      toast.success("Activity added")
      setContent("")
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add a note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Add Activity
      </Button>
    </div>
  )
}
