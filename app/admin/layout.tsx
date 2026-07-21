import { AdminSidebar, AdminTopbar } from "@/components/konexa/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-full">
      <AdminSidebar />
      <div className="flex min-h-full flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 bg-[#0B1120]">{children}</main>
      </div>
    </div>
  )
}
