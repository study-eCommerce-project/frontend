import AdminSidebar from "@/app/admin/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6 ml-52">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
