-- Luna App Database Schema
-- Run this in Supabase SQL Editor

-- Usuárias
create table if not exists profiles (
  id uuid references auth.users primary key,
  name text not null,
  email text,
  goal text check (goal in ('track_cycle','get_pregnant','avoid_pregnancy','health','menopause')),
  age_range text,
  height_cm integer,
  weight_kg decimal,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ciclos
create table if not exists cycles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  start_date date not null,
  end_date date,
  cycle_length integer default 28,
  flow_length integer default 5,
  is_current boolean default false,
  created_at timestamptz default now()
);

-- Logs diários
create table if not exists daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  log_date date not null,
  phase text check (phase in ('menstrual','follicular','ovulatory','luteal')),
  symptoms text[] default '{}',
  moods text[] default '{}',
  flow_intensity text check (flow_intensity in ('light','medium','heavy','clots')),
  water_ml integer,
  weight_kg decimal,
  sleep_hours decimal,
  steps integer,
  basal_temp decimal,
  notes text,
  sexual_activity boolean,
  created_at timestamptz default now(),
  unique(user_id, log_date)
);

-- Condições de saúde
create table if not exists health_conditions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  condition text check (condition in ('pcos','endometriosis','pmdd','thyroid','other')),
  created_at timestamptz default now()
);

-- Círculo de amigas
create table if not exists circle_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending','accepted','blocked')) default 'pending',
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- Modo Parceiro
create table if not exists partner_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  partner_name text,
  partner_email text,
  link_code text unique,
  is_active boolean default true,
  share_symptoms boolean default true,
  share_fertility boolean default true,
  created_at timestamptz default now()
);

-- Configurações do ciclo
create table if not exists cycle_settings (
  user_id uuid references profiles(id) primary key,
  cycle_length integer default 28,
  flow_length integer default 5,
  luteal_phase_length integer default 14,
  show_fertile_window boolean default true,
  reminder_period boolean default true,
  reminder_ovulation boolean default true,
  reminder_log boolean default true,
  updated_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table cycles enable row level security;
alter table daily_logs enable row level security;
alter table health_conditions enable row level security;
alter table circle_connections enable row level security;
alter table partner_connections enable row level security;
alter table cycle_settings enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can manage own cycles" on cycles for all using (auth.uid() = user_id);
create policy "Users can manage own logs" on daily_logs for all using (auth.uid() = user_id);
create policy "Users can manage own conditions" on health_conditions for all using (auth.uid() = user_id);
create policy "Users can manage circle" on circle_connections for all using (auth.uid() = user_id);
create policy "Users can manage partner" on partner_connections for all using (auth.uid() = user_id);
create policy "Users can manage settings" on cycle_settings for all using (auth.uid() = user_id);
