"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex gap-8">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AuthGuard>
  );
}
