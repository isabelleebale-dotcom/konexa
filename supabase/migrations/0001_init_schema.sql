-- KONEXA — schéma initial complet
-- Rôles: famille, entreprise, agent, admin (Éric Bruno)

-- ============================================================
-- 1. ENUMS
-- ============================================================

create type user_role as enum ('famille', 'entreprise', 'agent', 'admin');
create type service_type as enum ('menagere', 'nounou', 'agent_entretien');
create type agent_status as enum ('pending', 'validated', 'rejected', 'active', 'inactive', 'suspended');
create type doc_type as enum ('id_card', 'cv', 'other');
create type requester_type as enum ('famille', 'entreprise');
create type request_status as enum ('submitted', 'proposed', 'accepted', 'payment_pending', 'fulfilled', 'cancelled');
create type slot_status as enum ('open', 'proposed', 'accepted', 'filled', 'cancelled');
create type proposal_status as enum ('pending', 'accepted', 'declined', 'expired');
create type placement_status as enum ('pending_payment', 'active', 'replacement_in_progress', 'completed', 'cancelled');
create type payment_type as enum ('placement_fee', 'monthly_commission', 'express_replacement_fee');
create type payment_status as enum ('pending', 'processing', 'confirmed', 'failed', 'refunded');
create type payment_method as enum ('mtn_momo', 'orange_money');
create type review_status as enum ('scheduled', 'published', 'hidden');
create type replacement_type as enum ('free_guarantee', 'express_paid');
create type replacement_status as enum ('requested', 'agent_reassigned', 'completed', 'cancelled');
create type issue_status as enum ('open', 'in_progress', 'resolved');
create type presence_status as enum ('present', 'absent', 'late');
create type invoice_status as enum ('draft', 'issued', 'paid', 'overdue');
create type notification_channel as enum ('sms', 'whatsapp', 'email');
create type notification_status as enum ('queued', 'sent', 'failed');

-- ============================================================
-- 2. REFERENCE DATA
-- ============================================================

create table quartiers (
  id serial primary key,
  name text unique not null,
  is_active boolean not null default true,
  -- supplément FCFA facturé au client pour une mission dans ce quartier
  -- (zones éloignées du centre) ; 0 = pas de supplément.
  travel_fee integer not null default 0
);

-- Zone centrale bien couverte : pas de supplément.
insert into quartiers (name, travel_fee) values
  ('Akwa', 0), ('Bonanjo', 0), ('Bonapriso', 0), ('Deïdo', 0), ('Bali', 0),
  ('Makepe', 0), ('Bonamoussadi', 0), ('Bepanda', 0), ('New Bell', 0),
  ('Ndokoti', 0), ('Kotto', 0);

-- Zones plus éloignées : supplément de déplacement transparent, plutôt
-- que de les exclure — reste actif dès le lancement pour ne pas fermer
-- la demande, mais signalé clairement au client au moment du paiement.
insert into quartiers (name, travel_fee) values
  ('Logpom', 5000), ('Logbaba', 5000), ('Ndogbong', 5000),
  ('Cité des Palmiers', 5000), ('Yassa', 7000),
  ('PK8', 7000), ('PK9', 7000), ('PK10', 7000), ('PK11', 8000),
  ('PK12', 8000), ('PK13', 8000), ('PK14', 8000);

insert into quartiers (name, travel_fee) values ('Autre', 0);

-- ============================================================
-- 3. PROFILES (1:1 with auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  locale text not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table famille_profiles (
  user_id uuid primary key references profiles (id) on delete cascade,
  quartier_id integer references quartiers (id),
  quartier_free_text text,
  address_detail text,
  city text not null default 'Douala'
);

create table entreprise_profiles (
  user_id uuid primary key references profiles (id) on delete cascade,
  company_name text not null,
  sector text,
  rccm_number text,
  quartier_id integer references quartiers (id),
  quartier_free_text text,
  address_detail text,
  billing_contact_name text,
  billing_contact_phone text
);

-- helper: is the current user an admin? (SECURITY DEFINER avoids RLS recursion on profiles)
create function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- auto-create profile row on signup (expects role/first_name/last_name in auth.users.raw_user_meta_data)
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, role, first_name, last_name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'famille'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.phone, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 4. AGENTS (protected core entity)
-- ============================================================

create table agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  photo_url text,
  service_type service_type not null,
  bio text,
  experience_years integer not null default 0,
  availability boolean not null default true,
  status agent_status not null default 'pending',
  created_at timestamptz not null default now(),
  validated_by uuid references profiles (id),
  validated_at timestamptz
);

create table agent_documents (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents (id) on delete cascade,
  doc_type doc_type not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- zones où l'agent accepte des missions (multi-quartiers) — un client à
-- Bonapriso ne doit voir que les agents qui couvrent Bonapriso.
create table agent_quartiers (
  agent_id uuid not null references agents (id) on delete cascade,
  quartier_id integer not null references quartiers (id),
  primary key (agent_id, quartier_id)
);

-- public-safe view: never exposes last_name or phone; quartier_ids is the
-- agent's declared intervention zones (see agent_quartiers).
create view agents_public as
  select
    a.id, a.first_name, a.photo_url, a.service_type, a.bio, a.experience_years,
    a.availability, a.status,
    coalesce(
      (select array_agg(aq.quartier_id order by aq.quartier_id)
       from agent_quartiers aq where aq.agent_id = a.id),
      '{}'
    ) as quartier_ids
  from agents a
  where a.status in ('validated', 'active');

-- ============================================================
-- 5. REQUESTS -> SLOTS -> PROPOSALS -> PLACEMENTS
-- ============================================================

create table requests (
  id uuid primary key default gen_random_uuid(),
  requester_type requester_type not null,
  requester_id uuid not null references profiles (id) on delete cascade,
  service_type service_type not null,
  quartier_id integer references quartiers (id),
  desired_start_date date,
  number_of_agents integer not null default 1,
  sector_constraints text,
  spec_doc_storage_path text,
  notes text,
  status request_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create table request_slots (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id) on delete cascade,
  slot_index integer not null,
  status slot_status not null default 'open',
  unique (request_id, slot_index)
);

create table proposals (
  id uuid primary key default gen_random_uuid(),
  request_slot_id uuid not null references request_slots (id) on delete cascade,
  agent_id uuid not null references agents (id),
  proposed_by uuid not null references profiles (id),
  status proposal_status not null default 'pending',
  proposed_at timestamptz not null default now(),
  responded_at timestamptz
);

create table placements (
  id uuid primary key default gen_random_uuid(),
  request_slot_id uuid not null references request_slots (id),
  proposal_id uuid not null references proposals (id),
  agent_id uuid not null references agents (id),
  client_type requester_type not null,
  client_id uuid not null references profiles (id),
  service_type service_type not null,
  -- copié depuis requests.quartier_id à la création du placement, pour
  -- calculer le supplément de déplacement (quartiers.travel_fee) sans
  -- remonter la chaîne request_slots -> requests à chaque paiement.
  quartier_id integer references quartiers (id),
  salary_monthly integer not null,
  commission_rate numeric not null default 0.10,
  placement_fee_amount integer not null,
  start_date date not null,
  status placement_status not null default 'pending_payment',
  replacement_guarantee_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. PAYMENTS
-- ============================================================

create table payments (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references placements (id) on delete cascade,
  type payment_type not null,
  amount integer not null,
  currency text not null default 'XAF',
  period_month integer,
  period_year integer,
  status payment_status not null default 'pending',
  moneroo_transaction_id text unique,
  moneroo_payment_method payment_method,
  paid_at timestamptz,
  receipt_storage_path text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. REVIEWS
-- ============================================================

create table reviews (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references placements (id) on delete cascade,
  agent_id uuid not null references agents (id),
  client_id uuid not null references profiles (id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  status review_status not null default 'scheduled',
  scheduled_publish_at timestamptz not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create view agent_reviews_public as
  select r.id, r.agent_id, p.first_name as client_first_name,
         r.rating, r.comment, r.published_at
  from reviews r
  join profiles p on p.id = r.client_id
  where r.status = 'published';

-- ============================================================
-- 8. REPLACEMENTS & ISSUES
-- ============================================================

create table replacement_requests (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references placements (id) on delete cascade,
  requested_by uuid not null references profiles (id),
  reason text not null,
  type replacement_type not null,
  status replacement_status not null default 'requested',
  sla_deadline timestamptz not null,
  new_agent_id uuid references agents (id),
  express_fee_payment_id uuid references payments (id),
  created_at timestamptz not null default now()
);

create table issue_reports (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references placements (id) on delete cascade,
  reported_by uuid not null references profiles (id),
  category text not null,
  description text,
  status issue_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 9. ENTREPRISE: PRESENCE & INVOICING
-- ============================================================

create table agent_daily_presence (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references placements (id) on delete cascade,
  date date not null,
  status presence_status not null,
  reported_by uuid not null references profiles (id),
  notes text,
  unique (placement_id, date)
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references profiles (id) on delete cascade,
  period_month integer not null,
  period_year integer not null,
  total_amount integer not null default 0,
  pdf_storage_path text,
  status invoice_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  placement_id uuid not null references placements (id),
  payment_id uuid references payments (id),
  description text not null,
  amount integer not null
);

-- ============================================================
-- 10. NOTIFICATIONS LOG
-- ============================================================

create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  channel notification_channel not null,
  template_key text not null,
  payload jsonb,
  status notification_status not null default 'queued',
  provider_message_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 11. AGENT EARNINGS ESTIMATE (indicative, not a real ledger)
-- ============================================================

create view agent_earnings_estimate as
  select
    agent_id,
    sum(
      salary_monthly *
      greatest(
        1,
        (extract(year from age(coalesce(replacement_guarantee_expires_at, now()), start_date)) * 12
         + extract(month from age(coalesce(replacement_guarantee_expires_at, now()), start_date)))::int
      )
    ) as estimated_total_earnings
  from placements
  where status in ('active', 'completed')
  group by agent_id;

-- ============================================================
-- 12. RPC: reveal contact info only for an active placement
-- ============================================================

create function get_placement_contact(p_placement_id uuid)
returns table (
  counterpart_first_name text,
  counterpart_last_name text,
  counterpart_phone text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_placement placements%rowtype;
begin
  select * into v_placement from placements where id = p_placement_id;

  if v_placement.id is null or v_placement.status <> 'active' then
    return;
  end if;

  if v_placement.client_id = auth.uid() then
    return query
      select a.first_name, a.last_name, a.phone
      from agents a where a.id = v_placement.agent_id;
  elsif exists (select 1 from agents a where a.id = v_placement.agent_id and a.user_id = auth.uid()) then
    return query
      select p.first_name, p.last_name, p.phone
      from profiles p where p.id = v_placement.client_id;
  end if;
end;
$$;

-- ============================================================
-- 13. RPC: admin dashboard KPIs
-- ============================================================

create function admin_kpis()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'pending_requests', (select count(*) from requests where status = 'submitted'),
    'active_placements', (select count(*) from placements where status = 'active'),
    'pending_applications', (select count(*) from agents where status = 'pending'),
    'revenue_this_month', (
      select coalesce(sum(amount), 0) from payments
      where status = 'confirmed'
        and date_trunc('month', paid_at) = date_trunc('month', now())
    ),
    'open_issues', (select count(*) from issue_reports where status = 'open')
  ) into result;

  return result;
end;
$$;

-- ============================================================
-- 14. updated_at trigger for profiles
-- ============================================================

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- 15. ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table famille_profiles enable row level security;
alter table entreprise_profiles enable row level security;
alter table agents enable row level security;
alter table agent_documents enable row level security;
alter table agent_quartiers enable row level security;
alter table requests enable row level security;
alter table request_slots enable row level security;
alter table proposals enable row level security;
alter table placements enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table replacement_requests enable row level security;
alter table issue_reports enable row level security;
alter table agent_daily_presence enable row level security;
alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table notifications_log enable row level security;
alter table quartiers enable row level security;

-- quartiers: public reference data
create policy quartiers_select_all on quartiers for select using (true);
create policy quartiers_admin_write on quartiers for all using (is_admin()) with check (is_admin());

-- profiles: self + admin
create policy profiles_select_self_or_admin on profiles for select
  using (id = auth.uid() or is_admin());
create policy profiles_update_self_or_admin on profiles for update
  using (id = auth.uid() or is_admin());
create policy profiles_admin_insert on profiles for insert
  with check (is_admin());

-- famille_profiles / entreprise_profiles: owner + admin
create policy famille_profiles_owner on famille_profiles for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());
create policy entreprise_profiles_owner on entreprise_profiles for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- agents: base table locked down; public browsing must go through agents_public view
create policy agents_admin_all on agents for all
  using (is_admin())
  with check (is_admin());
create policy agents_self_select on agents for select
  using (user_id = auth.uid());
create policy agents_self_update_availability on agents for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- agent_documents: owner agent + admin
create policy agent_documents_owner on agent_documents for all
  using (
    is_admin()
    or exists (select 1 from agents a where a.id = agent_documents.agent_id and a.user_id = auth.uid())
  )
  with check (
    is_admin()
    or exists (select 1 from agents a where a.id = agent_documents.agent_id and a.user_id = auth.uid())
  );

-- agent_quartiers: public read (drives catalog filtering via agents_public),
-- owner agent can manage their own coverage zones, admin all.
create policy agent_quartiers_select_all on agent_quartiers for select using (true);
create policy agent_quartiers_owner_write on agent_quartiers for insert
  with check (
    is_admin()
    or exists (select 1 from agents a where a.id = agent_quartiers.agent_id and a.user_id = auth.uid())
  );
create policy agent_quartiers_owner_delete on agent_quartiers for delete
  using (
    is_admin()
    or exists (select 1 from agents a where a.id = agent_quartiers.agent_id and a.user_id = auth.uid())
  );

-- requests / request_slots: requester + admin
create policy requests_owner on requests for all
  using (requester_id = auth.uid() or is_admin())
  with check (requester_id = auth.uid() or is_admin());

create policy request_slots_via_request on request_slots for select
  using (
    is_admin()
    or exists (select 1 from requests r where r.id = request_slots.request_id and r.requester_id = auth.uid())
  );
create policy request_slots_admin_write on request_slots for insert with check (is_admin());
create policy request_slots_admin_update on request_slots for update using (is_admin());

-- proposals: requester (read + accept/decline) + agent (read own) + admin
create policy proposals_admin_all on proposals for all
  using (is_admin())
  with check (is_admin());
create policy proposals_client_select on proposals for select
  using (
    exists (
      select 1 from request_slots s
      join requests r on r.id = s.request_id
      where s.id = proposals.request_slot_id and r.requester_id = auth.uid()
    )
  );
create policy proposals_client_respond on proposals for update
  using (
    exists (
      select 1 from request_slots s
      join requests r on r.id = s.request_id
      where s.id = proposals.request_slot_id and r.requester_id = auth.uid()
    )
  );
create policy proposals_agent_select on proposals for select
  using (exists (select 1 from agents a where a.id = proposals.agent_id and a.user_id = auth.uid()));

-- placements: client + agent (own, no contact columns — enforced by app querying safe columns) + admin
create policy placements_admin_all on placements for all
  using (is_admin())
  with check (is_admin());
create policy placements_client_select on placements for select
  using (client_id = auth.uid());
create policy placements_agent_select on placements for select
  using (exists (select 1 from agents a where a.id = placements.agent_id and a.user_id = auth.uid()));
create policy placements_client_update on placements for update
  using (client_id = auth.uid());

-- payments: via placement ownership (client only); admin all
create policy payments_admin_all on payments for all
  using (is_admin())
  with check (is_admin());
create policy payments_client_select on payments for select
  using (
    exists (select 1 from placements pl where pl.id = payments.placement_id and pl.client_id = auth.uid())
  );

-- reviews: client inserts own (post-placement), agent reads own, admin all; public via view
create policy reviews_admin_all on reviews for all
  using (is_admin())
  with check (is_admin());
create policy reviews_client_select on reviews for select
  using (client_id = auth.uid());
create policy reviews_client_insert on reviews for insert
  with check (
    client_id = auth.uid()
    and exists (select 1 from placements pl where pl.id = reviews.placement_id and pl.client_id = auth.uid())
  );
create policy reviews_agent_select on reviews for select
  using (exists (select 1 from agents a where a.id = reviews.agent_id and a.user_id = auth.uid()));

-- replacement_requests / issue_reports: requester + admin
create policy replacement_requests_owner on replacement_requests for all
  using (
    is_admin()
    or exists (select 1 from placements pl where pl.id = replacement_requests.placement_id and pl.client_id = auth.uid())
  )
  with check (
    is_admin()
    or exists (select 1 from placements pl where pl.id = replacement_requests.placement_id and pl.client_id = auth.uid())
  );

create policy issue_reports_owner on issue_reports for all
  using (
    is_admin()
    or exists (select 1 from placements pl where pl.id = issue_reports.placement_id and pl.client_id = auth.uid())
  )
  with check (
    is_admin()
    or exists (select 1 from placements pl where pl.id = issue_reports.placement_id and pl.client_id = auth.uid())
  );

-- agent_daily_presence: entreprise that owns the placement + admin
create policy agent_daily_presence_owner on agent_daily_presence for all
  using (
    is_admin()
    or exists (select 1 from placements pl where pl.id = agent_daily_presence.placement_id and pl.client_id = auth.uid())
  )
  with check (
    is_admin()
    or exists (select 1 from placements pl where pl.id = agent_daily_presence.placement_id and pl.client_id = auth.uid())
  );

-- invoices / invoice_line_items: owning entreprise + admin
create policy invoices_owner on invoices for select
  using (entreprise_id = auth.uid() or is_admin());
create policy invoices_admin_write on invoices for all
  using (is_admin())
  with check (is_admin());

create policy invoice_line_items_owner on invoice_line_items for select
  using (
    is_admin()
    or exists (select 1 from invoices i where i.id = invoice_line_items.invoice_id and i.entreprise_id = auth.uid())
  );
create policy invoice_line_items_admin_write on invoice_line_items for all
  using (is_admin())
  with check (is_admin());

-- notifications_log: admin only
create policy notifications_log_admin_only on notifications_log for all
  using (is_admin())
  with check (is_admin());
