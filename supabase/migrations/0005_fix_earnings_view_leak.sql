-- KONEXA — corrige une fuite de confidentialité découverte en construisant
-- l'espace agent : agent_earnings_estimate n'avait aucun filtrage de
-- lignes. Comme les vues Postgres s'exécutent avec les droits de leur
-- propriétaire (c'est justement le mécanisme qui permet à agents_public
-- de contourner le RLS de `agents` pour publier un sous-ensemble sûr), la
-- vue contournait aussi le RLS de `placements` — n'importe quel compte
-- authentifié pouvait lire les gains estimés de TOUS les agents. Le
-- correctif : intégrer le contrôle d'accès directement dans la requête de
-- la vue (auth.uid() reste évalué correctement même en exécution
-- "définisseur").

create or replace view agent_earnings_estimate as
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
    and (
      is_admin()
      or exists (
        select 1 from agents a
        where a.id = placements.agent_id and a.user_id = auth.uid()
      )
    )
  group by agent_id;
