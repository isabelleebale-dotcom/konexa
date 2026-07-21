import type { NotificationProvider } from "@/lib/notifications/provider"

/** Dev default — no external call, caller (service.ts) logs to notifications_log. */
export const mockNotificationProvider: NotificationProvider = {
  async send(to, templateKey) {
    return { providerMessageId: `mock_${templateKey}_${Date.now()}` }
  },
}
