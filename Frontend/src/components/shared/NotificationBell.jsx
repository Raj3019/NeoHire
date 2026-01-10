'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';

const NotificationBell = () => {
    const { 
        user, 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markNotificationAsRead, 
        markAllNotificationsAsRead,
        initSocket 
    } = useAuthStore();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user?._id || user?.id) {
            fetchNotifications();
            initSocket(user._id || user.id);
        }
    }, [user, fetchNotifications, initSocket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        markNotificationAsRead(id);
    };

    const handleMarkAllAsRead = () => {
        markAllNotificationsAsRead();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 border-2 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] transition-all active:translate-y-[2px] active:shadow-none bg-white dark:bg-zinc-900 hover:bg-neo-yellow dark:hover:bg-neo-yellow dark:hover:text-black transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-neo-orange text-white text-[10px] font-black w-5 h-5 flex items-center justify-center border-2 border-neo-black dark:border-zinc-900 rounded-full animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[8px_8px_0px_0px_#ffffff] z-50 flex flex-col max-h-[500px] animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b-4 border-neo-black dark:border-white flex justify-between items-center bg-neo-blue text-white">
                        <h3 className="font-black text-lg uppercase">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold underline hover:no-underline uppercase"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="font-bold text-gray-500 uppercase">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    className={`p-4 border-b-2 border-neo-black dark:border-zinc-700 flex gap-3 transition-colors ${!notification.isRead ? 'bg-neo-yellow/10 dark:bg-neo-yellow/5' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 border border-neo-black dark:border-white uppercase ${
                                                notification.type === 'APPLICATION_RECEIVED' ? 'bg-neo-blue text-white' : 
                                                notification.type === 'STATUS_CHANGED' ? 'bg-neo-orange text-white' : 'bg-neo-green text-black'
                                            }`}>
                                                {notification.type?.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                        </div>
                                        <h4 className={`font-bold text-sm uppercase mb-1 ${!notification.isRead ? 'text-neo-black dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                                            {notification.message}
                                        </p>
                                        
                                        <div className="flex justify-between items-center">
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={(e) => handleMarkAsRead(e, notification._id)}
                                                    className="text-[10px] font-bold flex items-center gap-1 hover:text-neo-blue uppercase"
                                                >
                                                    <Check className="w-3 h-3" /> Mark as read
                                                </button>
                                            )}
                                            {notification.relatedJob && (
                                                <Link 
                                                    href={user.role === 'Recruiter' ? `/recruiter/jobs/` : `/candidate/jobs/`}
                                                    className="text-[10px] font-bold flex items-center gap-1 text-neo-blue hover:underline uppercase ml-auto"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    View Details <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link 
                        href="/notifications"
                        className="p-3 text-center font-black text-sm uppercase bg-white dark:bg-zinc-900 border-t-4 border-neo-black dark:border-white hover:bg-neo-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        See All Notifications
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
