'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Trash2, CheckCircle2, Clock, Briefcase, FileText } from 'lucide-react';
import { useNotifications } from '@/lib/notificationStore';
import { formatDate } from '@/lib/utils';
import { NeoButton, NeoBadge } from '@/components/ui/neo';
import Link from 'next/link';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false); // Track if position is calculated
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      // Reset positioned state first
      setIsPositioned(false);

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 320; // w-72/w-80 = 320px
        const windowWidth = window.innerWidth;

        // Calculate left position - prefer right-aligned but ensure it doesn't overflow
        let left = rect.right - dropdownWidth;
        if (left < 10) {
          // If it would overflow left, align to left edge of button instead
          left = rect.left;
        }
        // Ensure it doesn't overflow right side
        if (left + dropdownWidth > windowWidth - 10) {
          left = windowWidth - dropdownWidth - 10;
        }

        setDropdownPosition({
          top: rect.bottom + 12, // mt-3 = 12px
          left: Math.max(10, left)
        });

        // Mark as positioned after setting position
        setIsPositioned(true);
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'JobPosted': return <Briefcase className="w-4 h-4 text-neo-blue" />;
      case 'ApplicationStatusUpdate': return <CheckCircle2 className="w-4 h-4 text-neo-green" />;
      case 'NewApplication': return <FileText className="w-4 h-4 text-neo-orange" />;
      case 'AUTO_APPLY_SUCCESS': return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const dropdownContent = isOpen && mounted && isPositioned ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-72 md:w-80 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo dark:shadow-[6px_6px_0px_0px_#ffffff] z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
      style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
    >
      <div className="px-3 py-2 border-b-2 border-neo-black dark:border-white flex justify-between items-center bg-neo-yellow dark:bg-zinc-800">
        <h3 className="font-black uppercase tracking-tight text-sm dark:text-white">Notifications</h3>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-black uppercase text-neo-black dark:text-white hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
        {isLoading && notifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neo-black dark:border-white mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-5 h-5 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-400 uppercase text-[10px]">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-neo-black/10 dark:divide-white/10">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif._id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors relative group ${!notif.isRead ? 'bg-neo-blue/5' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-black uppercase truncate pr-4 ${!notif.isRead ? 'dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed mb-2 ${!notif.isRead ? 'text-neo-black dark:text-gray-200' : 'text-gray-500 dark:text-gray-500'}`}>
                      {notif.message}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="text-[10px] font-black uppercase text-neo-blue hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-neo-pink rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-500 group-hover:dark:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-2 py-2 border-t-2 border-neo-black dark:border-white bg-gray-50 dark:bg-zinc-800 text-center">
        <Link href="/notifications" onClick={() => setIsOpen(false)}>
          <button className="w-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-neo-black dark:hover:text-white py-1 transition-colors">
            View All Notifications
          </button>
        </Link>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 border-2 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] active:translate-y-[2px] active:shadow-none bg-white dark:bg-zinc-900 transition-all"
      >
        <Bell className="w-5 h-5 text-neo-black dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-neo-pink text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-neo-black animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {dropdownContent}
    </>
  );
};

export default NotificationBell;
