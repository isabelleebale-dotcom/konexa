import type { TemplateKey } from "@/lib/notifications/provider"

/** French SMS/WhatsApp copy. {{variable}} placeholders are substituted by the caller. */
export const templates: Record<TemplateKey, string> = {
  placement_proposal:
    "KONEXA : nous avons une proposition d'agent pour votre demande. Connectez-vous pour la consulter et confirmer.",
  payment_confirmed:
    "KONEXA : votre paiement a bien été confirmé. Le placement est maintenant actif. Merci de votre confiance.",
  payment_reminder:
    "KONEXA : la commission mensuelle de {{amount}} FCFA est due. Réglez-la depuis votre espace pour conserver la garantie de remplacement.",
  replacement_confirmed:
    "KONEXA : un nouvel agent a été proposé pour remplacer le précédent. Consultez votre espace pour les détails.",
  review_request_j7:
    "KONEXA : votre placement a débuté il y a 7 jours. Laissez un avis pour aider les futurs clients.",
  replacement_guarantee_expiring:
    "KONEXA : la garantie de remplacement gratuit de 30 jours arrive à expiration pour votre placement.",
}
