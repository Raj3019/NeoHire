'use client';
import React, { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useNotifications } from '@/lib/notificationStore';
import { useAuthStore } from '@/lib/store';
import { formatDate, formatDateTime } from '@/lib/utils';
import { NeoCard, NeoButton, NeoInput, NeoBadge } from '@/components/ui/neo';
import ProfileCompletionBanner from '@/components/shared/ProfileCompletionBanner';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  FileText, 
  Search, 
  Filter, 
  CheckCheck,
  Inbox
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isRecruiter = user?.role === 'Recruiter' || user?.role?.toLowerCase() === 'recruiter';
  const themeColor = isRecruiter ? 'text-neo-orange' : 'text-neo-blue';
  const themeBg = isRecruiter ? 'bg-neo-orange' : 'bg-neo-blue';
  const themeBorder = isRecruiter ? 'border-neo-orange' : 'border-neo-blue';

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' ? true : 
                         filter === 'unread' ? !notif.isRead : 
                         filter === 'read' ? notif.isRead : true;
    
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'JobPosted': return <Briefcase className="w-5 h-5 text-neo-blue" />;
      case 'ApplicationStatusUpdate': return <CheckCircle2 className={`w-5 h-5 ${isRecruiter ? 'text-neo-orange' : 'text-neo-green'}`} />;
      case 'NewApplication': return <FileText className="w-5 h-5 text-neo-orange" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-neo-bg dark:bg-zinc-950">
        <ProfileCompletionBanner />
        
        <div className="max-w-6xl mx-auto py-12 px-4">
          {/* Simple Professional Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight dark:text-white mb-2">
                Notifications
              </h1>
              <p className="font-mono text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'Your inbox is up to date'}
              </p>
            </div>
            
            <NeoButton 
              onClick={markAllAsRead} 
              variant="secondary" 
              size="sm"
              className="text-[10px] h-10 border-2 font-black shadow-neo-sm"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              MARK ALL AS READ
            </NeoButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Clean Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-5 shadow-neo-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Filters
                </h3>
                <div className="space-y-2">
                  {['all', 'unread', 'read'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`w-full text-left px-3 py-2 font-black uppercase text-[10px] border-2 transition-all ${
                        filter === f 
                        ? `${themeBg} text-white border-neo-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` 
                        : 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-neo-black dark:hover:border-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-mono font-bold text-gray-400 uppercase ml-1">Search</p>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 font-mono text-[11px] focus:outline-none dark:text-white transition-all shadow-neo-sm"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="lg:col-span-9 space-y-4">
              {isLoading && notifications.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black dark:border-white mx-auto"></div>
                  <p className="mt-4 font-mono font-bold uppercase text-[10px] dark:text-white tracking-widest text-gray-400">Loading...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800 bg-gray-50/20 dark:bg-zinc-900/10 shadow-neo-sm">
                  <Inbox className="w-10 h-10 text-gray-200 dark:text-zinc-800 mx-auto mb-4" />
                  <p className="font-mono font-bold text-gray-400 dark:text-gray-600 uppercase text-xs tracking-widest">No notifications found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`group p-5 border-2 transition-all relative ${!notif.isRead 
                        ? 'bg-white dark:bg-zinc-900 border-neo-black dark:border-white shadow-neo-sm' 
                        : 'bg-white/40 dark:bg-zinc-900/10 border-gray-100 dark:border-zinc-800 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="flex gap-5">
                        <div className={`shrink-0 w-12 h-12 border-2 ${!notif.isRead ? 'border-neo-black dark:border-white' : 'border-gray-100 dark:border-zinc-800'} flex items-center justify-center bg-white dark:bg-zinc-800`}>
                          {getIcon(notif.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-base font-black uppercase tracking-tight truncate pr-4 ${!notif.isRead ? 'dark:text-white' : 'text-gray-500'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 border border-gray-100 dark:border-zinc-800">
                              {formatDateTime(notif.createdAt)}
                            </span>
                          </div>
                          
                          <p className={`text-sm font-medium mb-4 leading-relaxed ${!notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                            {notif.message}
                          </p>
                          
                          <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800 pt-3">
                             <div className="flex gap-6">
                                {!notif.isRead && (
                                  <button 
                                    onClick={() => markAsRead(notif._id)}
                                    className={`text-[10px] font-black uppercase ${themeColor} hover:underline tracking-widest flex items-center gap-1.5`}
                                  >
                                    Mark as Read
                                  </button>
                                )}
                             </div>

                             {!notif.isRead && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 border-2 border-neo-black dark:border-white bg-neo-yellow shadow-neo-sm translate-x-1 translate-y-1">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-neo-black">New Alert</span>
                                </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
