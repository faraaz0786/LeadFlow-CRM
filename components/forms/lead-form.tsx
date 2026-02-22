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
  const fieldClassName =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

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
        className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-8 space-y-6"
      >
        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">
                  Lead Name
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input className={fieldClassName} placeholder="Jane Doe" {...field} />
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
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Company</FormLabel>
                <FormControl>
                  <Input className={fieldClassName} placeholder="Acme Corp" {...field} />
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
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Email</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClassName}
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
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Phone</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClassName}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="expected_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Expected Value ($)</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClassName}
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
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">
                  Stage
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className={fieldClassName}
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
              <div className="md:col-span-2">
                <FormLabel className="block text-sm font-medium text-slate-700 mb-1">Assign To Rep</FormLabel>
                <FormControl>
                  <select
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || null)
                    }
                    className={fieldClassName}
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
              </div>
            </FormItem>
          )}
        />

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {initialData?.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="mr-auto"
            >
              {deleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Lead
            </Button>
          )}

          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md px-4 py-2 text-sm"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-4 py-2 text-sm font-medium"
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? "Update Lead" : "Add Lead"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
