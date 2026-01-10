'use client';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Check, Trash2, Bell, ExternalLink, Calendar, Filter, Search } from 'lucide-react';
import Link from 'next/link';

const NotificationsPage = () => {
    const { 
        user, 
        notifications, 
        fetchNotifications, 
        markNotificationAsRead, 
        markAllNotificationsAsRead,
        isAuthenticated 
    } = useAuthStore();

    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated, fetchNotifications]);

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'all' || (filter === 'unread' && !n.isRead);
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             n.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-8 shadow-neo max-w-md w-full text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-neo-blue" />
                    <h1 className="text-2xl font-black uppercase mb-4">Access Denied</h1>
                    <p className="font-bold text-gray-600 dark:text-gray-400 mb-6 uppercase">Please login to view your notifications.</p>
                    <Link href="/login">
                        <button className="w-full bg-neo-yellow border-2 border-neo-black py-3 font-black uppercase shadow-neo-sm active:translate-y-1 active:shadow-none transition-all">
                            Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-neo-black dark:text-white">
                            Your <span className="text-neo-blue">Notifications</span>
                        </h1>
                        <p className="font-bold text-gray-500 uppercase mt-1">Stay updated with your career journey</p>
                    </div>
                    
                    {notifications.length > 0 && (
                        <button 
                            onClick={() => markAllNotificationsAsRead()}
                            className="bg-neo-green border-2 border-neo-black dark:border-white px-4 py-2 font-black uppercase shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] active:translate-y-[2px] active:shadow-none transition-all text-xs"
                        >
                            Mark All As Read
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-4 shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff]">
                            <h3 className="font-black uppercase mb-4 text-sm flex items-center gap-2">
                                <Filter className="w-4 h-4" /> Filters
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setFilter('all')}
                                    className={`w-full text-left px-3 py-2 font-bold uppercase text-xs border-2 ${filter === 'all' ? 'bg-neo-blue text-white border-neo-black' : 'border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                                >
                                    All Notifications
                                </button>
                                <button 
                                    onClick={() => setFilter('unread')}
                                    className={`w-full text-left px-3 py-2 font-bold uppercase text-xs border-2 ${filter === 'unread' ? 'bg-neo-blue text-white border-neo-black' : 'border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                                >
                                    Unread Only
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-4 shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff]">
                            <h3 className="font-black uppercase mb-4 text-sm flex items-center gap-2">
                                <Search className="w-4 h-4" /> Search
                            </h3>
                            <input 
                                type="text"
                                placeholder="SEARCH..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-zinc-800 border-2 border-neo-black dark:border-white p-2 text-xs font-bold uppercase outline-none focus:bg-white dark:focus:bg-zinc-700"
                            />
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="md:col-span-3 space-y-4 pb-20">
                        {filteredNotifications.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-12 text-center shadow-neo">
                                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="font-black text-gray-400 uppercase">No notifications found</p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    className={`bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white p-6 shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff] transition-all relative ${!notification.isRead ? 'before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-2 before:bg-neo-blue' : ''}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[10px] font-black px-2 py-1 border-2 border-neo-black dark:border-white uppercase ${
                                                    notification.type === 'APPLICATION_RECEIVED' ? 'bg-neo-blue text-white' : 
                                                    notification.type === 'STATUS_CHANGED' ? 'bg-neo-orange text-white' : 'bg-neo-green text-black'
                                                }`}>
                                                    {notification.type?.replace('_', ' ')}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 uppercase">
                                                    <Calendar className="w-3 h-3" /> {formatDate(notification.createdAt)}
                                                </span>
                                            </div>
                                            
                                            <h2 className="text-xl font-black uppercase mb-2 text-neo-black dark:text-white">
                                                {notification.title}
                                            </h2>
                                            
                                            <p className="font-medium text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-zinc-800/50 p-3 border-l-2 border-neo-black dark:border-white">
                                                {notification.message}
                                            </p>

                                            <div className="flex flex-wrap gap-3">
                                                {notification.relatedJob && (
                                                    <Link href={user.role === 'Recruiter' ? `/recruiter/jobs/` : `/candidate/jobs/`}>
                                                        <button className="flex items-center gap-2 bg-neo-black text-white px-4 py-2 text-xs font-black uppercase hover:bg-neo-blue transition-colors">
                                                            View Details <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    </Link>
                                                )}
                                                
                                                {!notification.isRead && (
                                                    <button 
                                                        onClick={() => markNotificationAsRead(notification._id)}
                                                        className="flex items-center gap-2 border-2 border-neo-black dark:border-white px-4 py-1.5 text-xs font-black uppercase hover:bg-neo-yellow dark:hover:text-black transition-colors"
                                                    >
                                                        <Check className="w-3 h-3" /> Mark Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
