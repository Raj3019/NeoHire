'use client';
import { useState, useEffect } from 'react';
import { notificationAPI } from './api';
import { useAuthStore } from './store';
import { io } from 'socket.io-client';

export const useNotificationStore = (set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await notificationAPI.getNotifications();
      if (res.success) {
        set({
          notifications: res.notifications || [],
          unreadCount: res.unreadCount || 0,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      if (res.success) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await notificationAPI.markAllAsRead();
      if (res.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      const res = await notificationAPI.deleteNotification(id);
      if (res.success) {
        set((state) => {
          const notificationToDelete = state.notifications.find(n => n._id === id);
          const wasUnread = notificationToDelete && !notificationToDelete.isRead;
          return {
            notifications: state.notifications.filter((n) => n._id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
});

// Since we can't easily merge into the existing store.js without risk, 
// let's create a separate store for notifications.
import { create } from 'zustand';

export const useNotifications = create((set, get) => ({
  ...useNotificationStore(set, get)
}));

// Socket hook for real-time notifications
export const useNotificationSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const addNotification = useNotifications((state) => state.addNotification);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to notification socket');
      socket.emit('register', user._id || user.id);
    });

    socket.on('notification', (data) => {
      console.log('New notification received:', data);
      addNotification(data);
      // Optional: Show a toast or play a sound
      if (Notification.permission === 'granted') {
        new Notification(data.title, { body: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, isAuthenticated, addNotification]);
};
