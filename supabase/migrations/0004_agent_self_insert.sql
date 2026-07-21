-- KONEXA — corrige un bug découvert pendant l'audit de sécurité : aucune
-- policy n'autorisait un utilisateur fraîchement authentifié à créer sa
-- propre fiche `agents` lors de la candidature (app/devenir-agent). La
-- policy ci-dessous n'autorise que la création d'une ligne dont
-- `user_id` = l'appelant — jamais au nom de quelqu'un d'autre, et jamais
-- avec status/trust_tier différents des valeurs par défaut ('pending' /
-- NULL), ce qui reste couvert par le trigger de la migration 0003.

create policy agents_self_insert on agents for insert
  with check (user_id = auth.uid());

-- Empêche un même compte de soumettre plusieurs fiches agent (abus/duplication).
alter table agents add constraint agents_user_id_unique unique (user_id);
