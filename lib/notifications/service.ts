import { createServiceClient } from "@/lib/supabase/service"
import { mockNotificationProvider } from "@/lib/notifications/providers/mock"
import type { NotificationProvider, TemplateKey } from "@/lib/notifications/provider"

function getNotificationProvider(): NotificationProvider {
  // Real vendor (Twilio / Africa's Talking) wired here in Phase 6 via
  // NOTIFICATION_PROVIDER env toggle, mirroring lib/payments/get-provider.ts.
  return mockNotificationProvider
}

/**
 * Sends a notification and logs it to notifications_log. Called from
 * server actions/route handlers at the point a state transition happens
 * (proposal created, payment confirmed, replacement confirmed, ...).
 */
export async function notifyUser(
  userId: string,
  templateKey: TemplateKey,
  variables: Record<string, string>
) {
  const supabase = createServiceClient()
  const provider = getNotificationProvider()

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", userId)
    .single()

  if (!profile) return

  try {
    const { providerMessageId } = await provider.send(
      profile.phone,
      templateKey,
      variables
    )

    await supabase.from("notifications_log").insert({
      user_id: userId,
      channel: "sms",
      template_key: templateKey,
      payload: variables,
      status: "sent",
      provider_message_id: providerMessageId,
    })
  } catch {
    await supabase.from("notifications_log").insert({
      user_id: userId,
      channel: "sms",
      template_key: templateKey,
      payload: variables,
      status: "failed",
    })
  }
}
