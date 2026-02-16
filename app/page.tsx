import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tight lg:text-8xl text-primary">
            LeadFlow
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px]">
            The modern, role-based CRM for high-velocity sales teams.
            Manage leads, track pipeline, and close deals faster.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-8 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-md bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-opacity border border-border"
          >
            Sign Up
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} LeadFlow CRM. MVP Build.
      </footer>
    </div>
  )
}
