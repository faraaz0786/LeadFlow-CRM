"use client"

import { addActivityAction } from "@/app/actions/activities"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import {
  Phone,
  Mail,
  MessageSquare,
  StickyNote,
  User,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ActivityList({
  leadId,
  initialActivities,
}: {
  leadId: string
  initialActivities: any[]
}) {
  const [activities, setActivities] =
    useState(initialActivities)
  const [note, setNote] = useState("")
  const [type, setType] = useState("note")
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!note.trim()) return

    setLoading(true)

    const result = await addActivityAction(
      leadId,
      type,
      note
    )

    if (result.success && result.data) {
      toast.success("Activity logged")
      setNote("")
      setType("note")

      setActivities((prev) => [
        result.data,
        ...prev,
      ])
    } else {
      toast.error(
        result.error || "Failed to log activity"
      )
    }

    setLoading(false)
  }

  const icons: Record<string, any> = {
    call: Phone,
    email: Mail,
    whatsapp: MessageSquare,
    meeting: User,
    note: StickyNote,
  }

  return (
    <div className="space-y-6">
      {/* Log Activity */}
      <div className="space-y-4 border rounded-xl p-5 bg-card shadow-sm">
        <h3 className="font-semibold text-sm tracking-wide">
          Log Activity
        </h3>

        <div className="flex flex-wrap gap-2">
          {["note", "call", "email", "meeting"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {t.charAt(0).toUpperCase() +
                  t.slice(1)}
              </button>
            )
          )}
        </div>

        <textarea
          className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Describe what happened..."
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={
              loading || !note.trim()
            }
          >
            {loading
              ? "Logging..."
              : "Log Activity"}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          Timeline
        </h3>

        <div className="relative border-l border-muted ml-4 space-y-8">
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground pl-6">
              No activities yet.
            </p>
          )}

          <AnimatePresence>
            {activities.map((activity) => {
              const ActivityIcon =
                icons[activity.type] ||
                StickyNote

              return (
                <motion.div
                  key={activity.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="relative pl-8"
                >
                  <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border shadow-sm">
                    <ActivityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {activity.user?.name ||
                        "Unknown User"}{" "}
                      logged a{" "}
                      <span className="capitalize">
                        {activity.type}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>

                    <time className="text-xs text-muted-foreground">
                      {format(
                        new Date(
                          activity.created_at
                        ),
                        "PP p"
                      )}
                    </time>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
