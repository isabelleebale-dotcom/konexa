-- KONEXA — bascule la vérification de compte sur l'email plutôt que le SMS
-- (aucun fournisseur SMS gratuit et illimité n'existe ; l'email est
-- gratuit et fonctionne immédiatement via Supabase). Le téléphone reste
-- collecté et stocké — utile pour les notifications SMS une fois un vrai
-- compte Twilio payant configuré (voir lib/notifications).
--
-- Avant : le trigger lisait new.phone (rempli par l'auth téléphone).
-- Maintenant : le téléphone vient des métadonnées du formulaire, et
-- l'email vient directement de auth.users.email (rempli par l'auth email).

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, role, first_name, last_name, phone, email)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'famille'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone, ''),
    new.email
  );
  return new;
end;
$$;
