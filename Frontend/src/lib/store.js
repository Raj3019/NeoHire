import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { employeeAPI, recruiterAPI, jobsAPI } from './api';
import { cookieStorage, scrubStorage } from './utils';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login function - calls backend API
      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const api = (role === 'Recruiter' || role?.toLowerCase() === 'recruiter') ? recruiterAPI : employeeAPI;
          const response = await api.login(email, password);

          // console.log('Login response:', response);

          // Try to fetch user profile after successful login - cookies are now handled by browser
          let profileData = null;
          try {
            profileData = await api.getProfile();
            // console.log('Profile response:', profileData);
          } catch (profileError) {
            //  console.error('Profile fetch failed:', profileError);
            // Continue with basic user data if profile fetch fails
          }

          // Build user object
          const profileInfo = profileData?.data || profileData?.profile || profileData?.user || profileData || {};

          // Get role from profile (DB) or fallback to login type
          let finalRole = profileInfo.role || role || 'Employee';
          const normalized = finalRole.toLowerCase();

          if (normalized === 'admin') finalRole = 'Admin';
          else if (normalized === 'recruiter') finalRole = 'Recruiter';
          else finalRole = 'Employee';

          const { success: _s, message: _m, role: _, ...cleanProfileInfo } = profileInfo;

          const user = {
            ...cleanProfileInfo,
            email,
            role: finalRole,
            isAuthenticated: true,
          };

          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please try again.';
          // Only set local error if not already handled by global toast (429/500)
          if (!error.isHandled) {
            set({ error: errorMessage, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return { success: false, error: errorMessage, isHandled: error.isHandled };
        }
      },

      // Signup function - calls backend API
      signup: async (email, password, confirmPassword, role, fullName) => {
        set({ isLoading: true, error: null });
        try {
          const api = (role === 'Recruiter' || role?.toLowerCase() === 'recruiter') ? recruiterAPI : employeeAPI;
          const response = await api.signup(email, password, confirmPassword, fullName);

          // Both roles now require verification
          set({ isLoading: false });
          return {
            success: true,
            message: response.message || "Registration successful! Please check your email to verify your account.",
            requiresVerification: true
          };

          const userRole = (role === 'Recruiter' || role?.toLowerCase() === 'recruiter') ? 'Recruiter' : 'Employee';
          const user = {
            email,
            role: userRole,
            isAuthenticated: true,
          };

          set({ user, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Signup failed. Please try again.';
          // Only set local error if not already handled by global toast (429/500)
          if (!error.isHandled) {
            set({ error: errorMessage, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return { success: false, error: errorMessage, isHandled: error.isHandled };
        }
      },

      // Fetch profile from backend. If `role` is provided, use that API.
      // If no role provided, try recruiter first then employee to correctly
      // restore sessions when only a token cookie exists.
      fetchProfile: async (role) => {
        set({ isLoading: true, error: null });
        const tryApi = async (api) => {
          const response = await api.getProfile();
          return response;
        };

        try {
          const currentUserRole = get().user?.role;

          // Build user object from response
          const buildUser = (response, requestedRole) => {
            const profileData = response.data || response.profile || response.user || response;
            const { success: _s, message: _m, ...cleanData } = profileData;

            // Priority: profileData.role (from DB) > requestedRole > currentRole
            let finalRole = cleanData.role || requestedRole || currentUserRole || 'Employee';

            // Normalize role string
            const normalized = finalRole.toLowerCase();
            if (normalized === 'admin') finalRole = 'Admin';
            else if (normalized === 'recruiter') finalRole = 'Recruiter';
            else finalRole = 'Employee';

            return {
              ...cleanData,
              recentApplicationJob: response.recentApplicationJob,
              role: finalRole,
              isAuthenticated: true,
            };
          };

          let response;

          if (role) {
            const targetApi = (role === 'Recruiter' || role?.toLowerCase() === 'recruiter') ? recruiterAPI : employeeAPI;
            response = await tryApi(targetApi);
            const user = buildUser(response, role);
            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true, data: user };
          }

          // No explicit role: try recruiter first, then employee
          try {
            response = await tryApi(recruiterAPI);
            const user = buildUser(response, 'Recruiter');
            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true, data: user };
          } catch (recErr) {
            // If recruiter returns 401/403, fall back to employee
            try {
              response = await tryApi(employeeAPI);
              const user = buildUser(response, 'Employee');
              set({ user, isAuthenticated: true, isLoading: false });
              return { success: true, data: user };
            } catch (empErr) {
              const errorMessage =
                empErr.response?.data?.error || empErr.response?.data?.message ||
                recErr.response?.data?.error || recErr.response?.data?.message ||
                'Failed to fetch profile.';
              if (empErr.response?.status === 401 || empErr.response?.status === 403 || recErr.response?.status === 401 || recErr.response?.status === 403) {
                set({ user: null, isAuthenticated: false, error: errorMessage, isLoading: false });
              } else {
                set({ isLoading: false });
              }
              return { success: false, error: errorMessage };
            }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch profile.';
          if (error.response?.status === 401 || error.response?.status === 403) {
            set({ user: null, isAuthenticated: false, error: errorMessage, isLoading: false });
          } else {
            // Check for rate limit/server error before setting local error
            if (!error.isHandled) {
              set({ error: errorMessage, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          }
          return { success: false, error: errorMessage, isHandled: error.isHandled };
        }
      },

      // Logout function - calls Better Auth API and clears user data
      logout: async () => {
        try {
          // Better Auth uses unified logout endpoint (both APIs point to same endpoint)
          await employeeAPI.logout().catch(() => { });
        } catch (error) {
          // Ignore errors since we're logging out anyway
        } finally {
          // Reset auth state
          set({ user: null, isAuthenticated: false, error: null });

          scrubStorage();
        }
      },

      // Update profile (for local state updates)
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);

// Mock Data Store for Jobs and Applications
export const useDataStore = create(
  persist(
    (set, get) => ({
      jobs: [],
      applications: [], // { jobId, candidateId, status, score }

      fetchJobs: async () => {
        try {
          const res = await jobsAPI.getAll();
          // API returns { data: [ ...jobs ] }
          set({ jobs: res.data || [] });
        } catch (e) {
          set({ jobs: [] });
        }
      },

      addJob: (job) => set((state) => ({
        jobs: [...state.jobs, { ...job, id: Math.random().toString(36).substr(2, 9), applicants: 0 }]
      })),

      applyToJob: (jobId, candidateId) => {
        const { jobs } = get();
        // Increment applicant count
        const updatedJobs = jobs.map(j => j.id === jobId ? { ...j, applicants: j.applicants + 1 } : j);

        // Mock AI Score
        const score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;

        set((state) => ({
          jobs: updatedJobs,
          applications: [...state.applications, {
            id: Math.random().toString(36).substr(2, 9),
            jobId,
            candidateId,
            status: 'Applied',
            score,
            date: new Date().toISOString()
          }]
        }));

        return score; // Return score for UI display
      }
    }),
    {
      name: 'data-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
