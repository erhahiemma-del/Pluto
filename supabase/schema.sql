-- Pluto Extra Mile cards: run once in Supabase → SQL Editor.
create table if not exists public.extra_mile_cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign text not null default 'ThoseWhoWentTheExtraMile',
  recipient_name text,
  relationship text,
  message text,
  selected_traits text[] default '{}',
  creator_first_name text,
  creator_last_name text,
  creator_email text,
  creator_job_title text,
  creator_company text,
  creator_industry text,
  marketing_consent boolean not null default false
);

create index if not exists extra_mile_cards_created_at_idx on public.extra_mile_cards (created_at desc);

-- Row Level Security on, with no public policies:
-- only the server (service role key) can read or write. The browser never talks to this table directly.
alter table public.extra_mile_cards enable row level security;
