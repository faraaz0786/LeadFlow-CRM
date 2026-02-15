"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { leadSchema } from "@/types/schema"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
} from "@/app/actions/leads"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function LeadForm({
  stages,
  reps,
  initialData,
}: {
  stages: any[]
  reps: any[]
  initialData?: any
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const defaultValues = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    expected_value: initialData?.expected_value || 0,
    status:
      initialData?.status ||
      (stages.length > 0 ? stages[0].id : ""),
    assigned_rep_id: initialData?.assigned_rep_id || null,
  }

  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues,
  })

  /* ===========================
     SUBMIT
  =========================== */

  async function onSubmit(values: z.infer<typeof leadSchema>) {
    setLoading(true)

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })

    try {
      let result

      if (initialData?.id) {
        result = await updateLeadAction(
          initialData.id,
          null,
          formData
        )
      } else {
        result = await createLeadAction(null, formData)
      }

      if (!result.success) {
        toast.error(result.message || "Operation failed")
        return
      }

      toast.success(
        initialData ? "Lead updated successfully" : "Lead created successfully"
      )

      router.push("/admin/leads")
      router.refresh()
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  /* ===========================
     DELETE
  =========================== */

  async function handleDelete() {
    if (!initialData?.id) return

    const confirmed = window.confirm(
      "Are you sure you want to delete this lead? This action cannot be undone."
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      const result = await deleteLeadAction(initialData.id)

      if (!result.success) {
        toast.error(result.message || "Delete failed")
        return
      }

      toast.success("Lead deleted successfully")

      router.push("/admin/leads")
      router.refresh()
    } catch {
      toast.error("Unexpected error while deleting")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* BASIC INFO */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="jane@acme.com"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 555 000 0000"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* VALUE + STAGE */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expected_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Value ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage *</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {stages.map((stage) => (
                      <option
                        key={stage.id}
                        value={stage.id}
                      >
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ASSIGN REP */}
        <FormField
          control={form.control}
          name="assigned_rep_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To Rep</FormLabel>
              <FormControl>
                <select
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value || null)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {reps.map((rep) => (
                    <option
                      key={rep.id}
                      value={rep.id}
                    >
                      {rep.name || rep.email}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center">
          {initialData?.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Lead
            </Button>
          )}

          <div className="flex gap-4 ml-auto">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {initialData ? "Update Lead" : "Add Lead"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
