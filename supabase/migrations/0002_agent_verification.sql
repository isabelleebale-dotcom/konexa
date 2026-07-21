-- KONEXA — vérification d'identité renforcée des agents + niveaux de confiance
--
-- Contexte : avant de recevoir des missions, un agent doit fournir pièce
-- d'identité, CV, casier judiciaire (si disponible), selfie avec pièce
-- d'identité, références, et sa position approximative. L'équipe KONEXA
-- valide manuellement ; les documents sensibles restent invisibles des
-- clients (seul le badge de confiance est public).

-- ============================================================
-- 1. Types de documents supplémentaires
-- ============================================================

alter type doc_type add value if not exists 'passport';
alter type doc_type add value if not exists 'criminal_record';
alter type doc_type add value if not exists 'selfie_with_id';
alter type doc_type add value if not exists 'reference_letter';

-- ============================================================
-- 2. Niveaux de confiance (badge public, jamais les documents)
-- ============================================================

create type trust_tier as enum ('verified', 'verified_plus', 'premium');

alter table agents add column trust_tier trust_tier;
alter table agents add column latitude numeric;
alter table agents add column longitude numeric;
alter table agents add column criminal_record_provided boolean not null default false;

comment on column agents.trust_tier is
  'Badge public : verified = identité confirmée · verified_plus = identité + références + casier vérifiés · premium = fixé par admin après missions réussies. NULL = pas encore vérifié, agent non visible côté client (cf. agents_public WHERE status).';
comment on column agents.latitude is 'Position approximative — usage interne KONEXA uniquement, jamais exposée côté client.';
comment on column agents.longitude is 'Position approximative — usage interne KONEXA uniquement, jamais exposée côté client.';

-- ============================================================
-- 3. Références (anciens employeurs / proches)
-- ============================================================

create table agent_references (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents (id) on delete cascade,
  full_name text not null,
  relationship text not null,
  phone text not null,
  notes text,
  verified boolean not null default false,
  verified_by uuid references profiles (id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table agent_references enable row level security;

create policy agent_references_admin_all on agent_references for all
  using (is_admin())
  with check (is_admin());

create policy agent_references_owner_select on agent_references for select
  using (exists (select 1 from agents a where a.id = agent_references.agent_id and a.user_id = auth.uid()));

create policy agent_references_owner_insert on agent_references for insert
  with check (exists (select 1 from agents a where a.id = agent_references.agent_id and a.user_id = auth.uid()));

-- ============================================================
-- 4. agents_public : expose le badge de confiance, jamais les documents/GPS
-- ============================================================

drop view if exists agents_public;

create view agents_public as
  select
    a.id, a.first_name, a.photo_url, a.service_type, a.bio, a.experience_years,
    a.availability, a.status, a.trust_tier,
    coalesce(
      (select array_agg(aq.quartier_id order by aq.quartier_id)
       from agent_quartiers aq where aq.agent_id = a.id),
      '{}'
    ) as quartier_ids
  from agents a
  where a.status in ('validated', 'active');

-- ============================================================
-- 5. Storage buckets : photo publique, documents privés (identité, CV,
--    casier, selfie) réservés à l'agent propriétaire + l'admin
-- ============================================================

insert into storage.buckets (id, name, public)
values ('agent-photos', 'agent-photos', true), ('agent-documents', 'agent-documents', false)
on conflict (id) do nothing;

create policy "agent-photos public read"
  on storage.objects for select
  using (bucket_id = 'agent-photos');

create policy "agent-photos owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'agent-photos'
    and (
      is_admin()
      or exists (
        select 1 from agents a
        where a.user_id = auth.uid()
          and (storage.foldername(name))[1] = a.id::text
      )
    )
  );

create policy "agent-documents owner read"
  on storage.objects for select
  using (
    bucket_id = 'agent-documents'
    and (
      is_admin()
      or exists (
        select 1 from agents a
        where a.user_id = auth.uid()
          and (storage.foldername(name))[1] = a.id::text
      )
    )
  );

create policy "agent-documents owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'agent-documents'
    and (
      is_admin()
      or exists (
        select 1 from agents a
        where a.user_id = auth.uid()
          and (storage.foldername(name))[1] = a.id::text
      )
    )
  );
