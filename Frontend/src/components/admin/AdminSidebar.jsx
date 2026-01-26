'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cookieStorage, cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    color: 'bg-neo-blue'
  },
  {
    label: 'Users',
    icon: Users,
    path: '/admin/users',
    color: 'bg-neo-pink'
  },
  {
    label: 'Jobs',
    icon: Briefcase,
    path: '/admin/jobs',
    color: 'bg-neo-yellow'
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = cookieStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      cookieStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      cookieStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Mobile Trigger - Positioned to side of navbar on admin pages */}
      <div className="md:hidden fixed top-2.5 left-4 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          {isOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[80] md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-56 bg-white dark:bg-zinc-950 border-r-4 border-neo-black dark:border-white z-[90] transition-transform duration-300 md:translate-x-0 p-6 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Header Spacer - Provides space for the fixed 'X' button */}
        <div className="md:hidden h-14 -mx-6 -mt-6 mb-6 border-b-2 border-neo-black bg-neo-black/5 flex items-center px-6">
           <div className="w-10"></div> {/* Space for the X button */}
           <span className="font-black uppercase tracking-tighter text-xs">Menu_Navigation</span>
        </div>

        {/* Logo Section */}
        <div className="mb-8 mt-4 md:mt-0 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-neo-black dark:bg-white border-2 border-neo-black flex items-center justify-center shadow-[3px_3px_0px_0px_#54A0FF] group-hover:rotate-6 transition-transform">
               <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white dark:text-neo-black" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-none">
                Neo<span className="text-neo-blue">Hire</span>
              </h2>
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Admin_Panel</span>
            </div>
          </Link>
          <div className="scale-75 origin-right">
             <NotificationBell />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "group relative flex items-center p-3 font-black uppercase tracking-widest text-[11px] border-2 transition-all",
                isActive(item.path) 
                  ? "bg-neo-black text-white dark:bg-white dark:text-black border-neo-black shadow-[4px_4px_0px_0px_#000]" 
                  : "bg-white dark:bg-zinc-900 border-transparent hover:border-neo-black dark:hover:border-white text-gray-500 hover:text-neo-black dark:hover:text-white"
              )}
            >
              <div className={cn(
                "w-8 h-8 flex items-center justify-center border-2 border-neo-black mr-3 shadow-[2px_2px_0px_0px_#000] transition-transform group-hover:-rotate-3",
                isActive(item.path) ? "bg-neo-yellow" : item.color
              )}>
                <item.icon className="w-4 h-4 text-neo-black" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive(item.path) && <ChevronRight className="w-4 h-4 text-white dark:text-black" />}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t-2 border-dashed border-gray-100 dark:border-zinc-800">
           {/* Admin Info & Theme Toggle */}
           <div className="mb-4 space-y-3">
              <div className="p-3 bg-neo-black/5 dark:bg-white/5 border-2 border-neo-black dark:border-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-neo-black bg-neo-blue overflow-hidden shadow-[2px_2px_0px_0px_#000]">
                    <img 
                      src={user?.profilePicture || "https://api.dicebear.com/7.x/pixel-art/svg?seed=Admin"} 
                      alt="Admin" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase truncate text-neo-black dark:text-white">
                      {user?.fullName || 'Root_Admin'}
                    </div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">
                      Sys_Operator
                    </div>
                  </div>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="p-1.5 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 shadow-[1.5px_1.5px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-neo-yellow" /> : <Moon className="w-3.5 h-3.5 text-neo-black dark:text-white" />}
                </button>
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full group flex items-center justify-center p-3 bg-neo-red text-white border-2 border-neo-black font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
           >
             <LogOut className="w-4 h-4 mr-2 group-hover:animate-bounce" />
             Log_Out
           </button>
           
           <div className="mt-4 text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">
              V.1.04_STABLE_BUILD
           </div>
        </div>
      </aside>
    </>
  );
}
