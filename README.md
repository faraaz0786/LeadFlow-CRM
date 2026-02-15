# LeadFlow CRM (MVP)

A modern, role-based CRM built for speed and aesthetics.

## 🏗 Project Architecture Overview

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (Custom Design System)
- **Backend:** Supabase (Postgres + Auth + Realtime)
- **Deployment:** Vercel

## 📁 Folder Structure

```
/app
   /auth
      /login
      /signup
      /forgot-password
   /admin
      /dashboard
      /leads
      /pipeline
      /users
      /templates
      /settings
   /rep
      /dashboard
      /leads
      /pipeline
      /followups
   /api               # Route Handlers
/components
   /ui                # Atomic UI components
   /forms             # Form components with Zod validation
   /tables            # Data tables
   /kanban            # Drag-and-drop board
   /charts            # Analytics charts
   /layout            # Layout wrappers
/lib
   supabase.ts        # Client initialization
   utils.ts           # Helper functions
/types
   index.ts           # Global type definitions
/hooks
   useAuth.ts
   useLeads.ts
```

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd leadflow-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.local` example and fill in your Supabase credentials.
   ```bash
   cp .env.local.example .env.local
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📦 Dependencies

- **Core:** `next`, `react`, `react-dom`
- **Styling:** `tailwindcss`, `clsx`, `tailwind-merge`, `lucide-react`
- **Data/Auth:** `@supabase/ssr`, `@supabase/supabase-js`, `swr` or `react-query` (TBD)
- **Utilities:** `date-fns`, `papaparse`
- **Forms:** `react-hook-form`, `zod`
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## 🎨 Design System Tokens

Defined in `app/globals.css` using Tailwind v4 CSS variables.

- **Primary:** Indigo/Violet (`--primary`)
- **Secondary:** Slate (`--secondary`)
- **Accent:** Slate/Zinc (`--accent`)
- **Destructive:** Red (`--destructive`)
- **Radius:** `0.5rem` (`rounded-md`)
- **Font:** Inter (Google Fonts)

## 🗄 Database Schema (Supabase SQL)

Run this in your Supabase SQL Editor to set up the database.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (Handled by Supabase Auth, but we need a public profile/role table)
-- Note: Simplified for MVP. We might link auth.users to a public 'profiles' or 'users' table.
create type user_role as enum ('admin', 'rep');

create table public.users (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  role user_role default 'rep',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- PIPELINE STAGES
create table public.pipeline_stages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  stage_order int not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Seed Stages
insert into pipeline_stages (name, stage_order) values
('New Lead', 1),
('Contacted', 2),
('Proposal Sent', 3),
('Negotiation', 4),
('Closed Won', 5),
('Closed Lost', 6);

-- LEADS
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text,
  phone text,
  company text,
  location text,
  source text,
  status uuid references public.pipeline_stages(id),
  assigned_rep_id uuid references public.users(id),
  expected_value numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- LEAD ACTIVITIES
create table public.lead_activities (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null, -- 'call', 'email', 'meeting'
  description text,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- LEAD FOLLOWUPS
create table public.lead_followups (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  followup_date timestamp with time zone not null,
  note text,
  created_by uuid references public.users(id),
  completed boolean default false
);

-- RLS POLICIES (Simplified)
alter table public.leads enable row level security;

-- Admin can see all
create policy "Admins can see all leads" on public.leads
  for all using (auth.uid() in (select id from public.users where role = 'admin'));

-- Reps can see assigned
create policy "Reps can see assigned leads" on public.leads
  for select using (auth.uid() = assigned_rep_id);

```

## 🔐 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

## 🧪 Testing Setup

- ESLint is configured.
- Run `npm run lint` to check for style issues.
- Manual testing required for Supabase RLS and Auth flows.

## 🚀 Production Notes

- Ensure RLS policies are strictly tested before full launch.
- Deploy to Vercel with Environment Variables set.
- Run migrations/seed data on the production database.

---
*Generated for MVP Build Phase 1*
