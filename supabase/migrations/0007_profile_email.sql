-- KONEXA — ajoute un champ email optionnel sur profiles. Le téléphone reste
-- la méthode d'authentification (aucun email requis, conformément au PRD),
-- mais le formulaire d'inscription famille/entreprise peut désormais le
-- capter comme coordonnée de contact supplémentaire.

alter table profiles add column email text;
