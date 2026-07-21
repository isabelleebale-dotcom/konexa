-- KONEXA — durcissement sécurité
--
-- Contexte : audit de sécurité demandé par l'utilisateur. Row Level Security
-- restreint quelles LIGNES sont visibles/modifiables, mais PAS quelles
-- COLONNES — plusieurs policies "self update" laissaient un utilisateur
-- authentifié modifier des colonnes sensibles de sa propre ligne (rôle,
-- statut de validation, montants...) alors que seul un admin devrait le
-- pouvoir. Corrigé ici par des triggers de verrouillage de colonnes (le
-- mécanisme standard Postgres pour ce que RLS seul ne peut pas exprimer),
-- et par des policies plus étroites là où "for all" était trop permissif.

-- ============================================================
-- 1. profiles — empêcher l'auto-promotion en admin
--    (profiles.role = 'admin' est la source de vérité de is_admin())
-- ============================================================

create function prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Seul un administrateur peut changer le rôle d''un compte';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on profiles
  for each row execute function prevent_role_self_escalation();

-- ============================================================
-- 2. agents — un agent ne doit pas pouvoir s'auto-valider ni
--    s'attribuer lui-même un badge de confiance
-- ============================================================

create function prevent_agent_self_validation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.status is distinct from old.status
      or new.trust_tier is distinct from old.trust_tier
      or new.validated_by is distinct from old.validated_by
      or new.validated_at is distinct from old.validated_at
      or new.user_id is distinct from old.user_id
      or new.criminal_record_provided is distinct from old.criminal_record_provided
    then
      raise exception 'Seul un administrateur peut valider un profil agent ou changer son badge';
    end if;
  end if;
  return new;
end;
$$;

create trigger agents_prevent_self_validation
  before update on agents
  for each row execute function prevent_agent_self_validation();

-- ============================================================
-- 3. proposals — un client ne doit pas pouvoir réassigner une
--    proposition à un autre agent ni falsifier son auteur
-- ============================================================

create function prevent_proposal_tampering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.agent_id is distinct from old.agent_id
      or new.request_slot_id is distinct from old.request_slot_id
      or new.proposed_by is distinct from old.proposed_by
    then
      raise exception 'Seul un administrateur peut modifier l''agent ou la demande liés à une proposition';
    end if;
  end if;
  return new;
end;
$$;

create trigger proposals_prevent_tampering
  before update on proposals
  for each row execute function prevent_proposal_tampering();

-- ============================================================
-- 4. placements — aucune fonctionnalité client n'a besoin d'un UPDATE
--    direct (la confirmation de paiement passe par le webhook, avec la
--    clé service role qui contourne RLS). Supprimer l'accès plutôt que
--    de le restreindre réduit la surface d'attaque à zéro pour un
--    bénéfice fonctionnel nul.
-- ============================================================

drop policy if exists placements_client_update on placements;

-- ============================================================
-- 5. payments — il manquait une policy d'INSERT pour les clients
--    (app/api/payments/initiate en avait besoin) ; la resserrer pour
--    n'autoriser que la création d'un paiement 'pending' sur un
--    placement qui leur appartient — jamais 'confirmed' directement.
-- ============================================================

create policy payments_client_insert on payments for insert
  with check (
    status = 'pending'
    and exists (select 1 from placements pl where pl.id = payments.placement_id and pl.client_id = auth.uid())
  );

-- ============================================================
-- 6. reviews — vérifier que l'avis porte bien sur l'agent réellement
--    lié au placement (empêche de poster un faux avis sur un autre
--    profil en falsifiant agent_id)
-- ============================================================

drop policy if exists reviews_client_insert on reviews;

create policy reviews_client_insert on reviews for insert
  with check (
    client_id = auth.uid()
    and exists (
      select 1 from placements pl
      where pl.id = reviews.placement_id
        and pl.client_id = auth.uid()
        and pl.agent_id = reviews.agent_id
    )
  );

-- ============================================================
-- 7. replacement_requests / issue_reports — "for all" laissait le
--    client modifier le statut, réassigner l'agent de remplacement ou
--    la date limite. On sépare : le client peut créer et lire les
--    siens, seul l'admin peut faire évoluer le dossier.
-- ============================================================

drop policy if exists replacement_requests_owner on replacement_requests;

create policy replacement_requests_admin_all on replacement_requests for all
  using (is_admin())
  with check (is_admin());

create policy replacement_requests_client_select on replacement_requests for select
  using (exists (select 1 from placements pl where pl.id = replacement_requests.placement_id and pl.client_id = auth.uid()));

create policy replacement_requests_client_insert on replacement_requests for insert
  with check (
    requested_by = auth.uid()
    and exists (select 1 from placements pl where pl.id = replacement_requests.placement_id and pl.client_id = auth.uid())
  );

drop policy if exists issue_reports_owner on issue_reports;

create policy issue_reports_admin_all on issue_reports for all
  using (is_admin())
  with check (is_admin());

create policy issue_reports_client_select on issue_reports for select
  using (exists (select 1 from placements pl where pl.id = issue_reports.placement_id and pl.client_id = auth.uid()));

create policy issue_reports_client_insert on issue_reports for insert
  with check (
    reported_by = auth.uid()
    and exists (select 1 from placements pl where pl.id = issue_reports.placement_id and pl.client_id = auth.uid())
  );
