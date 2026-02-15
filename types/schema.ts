import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = loginSchema.extend({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    // role: z.enum(['admin', 'rep']).optional(), // Usually signup is for reps or handled by admin invite? MVP PRD says "Signup". Let's assume generic user role (rep) default.
})

export const pipelineStageSchema = z.object({
    id: z.string(),
    name: z.string(),
    order: z.number()
})

export const leadSchema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    source: z.string().optional(),
    status: z.string().uuid('Invalid Stage ID'),
    assigned_rep_id: z.string().uuid('Invalid Rep ID').nullable(),
    expected_value: z.number().nonnegative(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LeadInput = z.infer<typeof leadSchema>
