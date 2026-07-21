-- KONEXA — génère automatiquement les request_slots à la création d'une
-- demande, plutôt que de laisser le client les insérer lui-même (ce qui
-- aurait exigé d'ouvrir une policy INSERT sur request_slots aux clients,
-- alors que seul l'admin doit pouvoir écrire sur cette table). Découvert
-- en testant le parcours famille de bout en bout : l'insertion manuelle
-- du créneau échouait avec une violation RLS.

create function create_request_slots()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
begin
  for i in 0 .. (new.number_of_agents - 1) loop
    insert into request_slots (request_id, slot_index) values (new.id, i);
  end loop;
  return new;
end;
$$;

create trigger requests_create_slots
  after insert on requests
  for each row execute function create_request_slots();
