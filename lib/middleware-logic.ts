import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Environment validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
        throw new Error(
            'Supabase environment variables are missing or misconfigured.'
        )
    }

    if (!supabaseUrl.startsWith('http')) {
        throw new Error('Invalid Supabase URL. Must start with http or https.')
    }

    // Authenticated client (respects RLS)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                )

                supabaseResponse = NextResponse.next({
                    request,
                })

                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 🔒 Protect private routes
    if (!user && !path.startsWith('/auth') && path !== '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        // Admin client (bypasses RLS)
        const adminClient = createClient(supabaseUrl, serviceRoleKey)

        const { data: profile } = await adminClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        console.log('USER ROLE:', profile?.role)

        // Prevent logged-in users from accessing auth routes
        if (path.startsWith('/auth')) {
            const url = request.nextUrl.clone()

            if (profile?.role === 'admin') {
                url.pathname = '/admin/dashboard'
            } else {
                url.pathname = '/rep/dashboard'
            }

            return NextResponse.redirect(url)
        }

        // Prevent reps from accessing admin routes
        if (path.startsWith('/admin') && profile?.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/rep/dashboard'
            return NextResponse.redirect(url)
        }

        // Prevent admin from accessing rep routes
        if (path.startsWith('/rep') && profile?.role === 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
