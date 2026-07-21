import { AgentNav } from "@/components/konexa/agent-nav"

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <AgentNav />
      <main className="flex-1 bg-secondary/20">{children}</main>
    </div>
  )
}
