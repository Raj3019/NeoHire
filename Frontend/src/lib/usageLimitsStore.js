'use client';
import { create } from 'zustand';
import { usageLimitsAPI } from './api';

export const useUsageLimits = create((set, get) => ({
  limits: null,
  isLoading: false,
  error: null,

  fetchLimits: async () => {
    // Prevent duplicate fetches
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const res = await usageLimitsAPI.getLimits();
      set({ limits: res.data, isLoading: false });
      return res.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Call after an action that consumes a limit (e.g., job created, application submitted)
  refreshLimits: async () => {
    try {
      const res = await usageLimitsAPI.getLimits();
      set({ limits: res.data });
      return res.data;
    } catch {
      return null;
    }
  },

  clearLimits: () => set({ limits: null, isLoading: false, error: null }),
}));
