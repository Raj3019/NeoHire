'use client';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationBell from '@/components/shared/NotificationBell';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex transition-colors duration-300">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-56">
          {/* Mobile Navigation Bar */}
          <div className="md:hidden sticky top-0 z-[50] h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b-2 border-neo-black dark:border-white flex items-center justify-between px-4">
             <div className="flex items-center">
                <div className="w-14 shrink-0"></div> {/* Increased reserved space for trigger */}
                <span className="font-black uppercase tracking-tighter text-xs dark:text-white">Neo<span className="text-neo-blue">Hire</span> <span className="opacity-50">/</span> Admin</span>
             </div>
             <div className="scale-90">
                <NotificationBell />
             </div>
          </div>

          <main className="p-4 md:p-8 pt-6 md:pt-14 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
