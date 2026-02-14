import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { employeeAPI, recruiterAPI, jobsAPI, resetAccountRestrictedFlag, isAccountCurrentlyRestricted, setGoogleRole } from './api';
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
        // Reset the restricted flag so login requests can go through after redirect
        resetAccountRestrictedFlag();
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
            // If primary profile fetch failed, check if they are the OTHER role
            // This happens because unified auth allows them in, but endpoint access is restricted
            try {
              if (role && (role === 'Recruiter' || role.toLowerCase() === 'recruiter')) {
                const empData = await employeeAPI.getProfile();
                profileData = empData;
              } else {
                const recData = await recruiterAPI.getProfile();
                profileData = recData;
              }
            } catch (otherError) {
              // Ignore
            }
          }

          // ✅ If account was flagged restricted during profile fetch, abort login immediately
          if (isAccountCurrentlyRestricted()) {
            // Clear any session that Better Auth may have created
            try { await employeeAPI.logout().catch(() => { }); } catch (e) { }
            scrubStorage();
            set({ user: null, isAuthenticated: false, isLoading: false, error: 'Your account has been restricted.' });
            return {
              success: false,
              error: 'Your account has been restricted.',
              isAccountRestricted: true,
              isHandled: true  // Toast already shown by interceptor
            };
          }

          // Build user object
          const profileInfo = profileData?.data || profileData?.profile || profileData?.user || profileData || {};

          // Get role from profile (DB) or fallback to login type
          let finalRole = profileInfo.role || role || 'Employee';
          const normalized = finalRole.toLowerCase();

          if (normalized === 'admin') finalRole = 'Admin';
          else if (normalized === 'recruiter') finalRole = 'Recruiter';
          else finalRole = 'Employee';

          // Enforce role validation: Prevent cross-role login
          if (role) {
            const requestedRole = role.toLowerCase();
            const actualRole = finalRole.toLowerCase();

            // Allow Admin to access any portal, but otherwise enforce strict role matching
            if (actualRole !== 'admin') {
              let mismatchError = null;

              // If trying to login as Recruiter but not a Recruiter (e.g. Employee)
              if (requestedRole === 'recruiter' && actualRole !== 'recruiter') {
                mismatchError = "Invalid credentials.";
              }
              // If trying to login as Employee/Candidate but is actually a Recruiter
              else if (requestedRole === 'employee' && actualRole !== 'employee') {
                mismatchError = "Invalid credentials.";
              }

              if (mismatchError) {
                // Clear the session immediately so we don't stay authenticated
                try {
                  await get().logout();
                } catch (e) { }

                const err = new Error("Role mismatch");
                // Use the error structure expected by the catch block
                err.response = { data: { message: mismatchError } };
                throw err;
              }
            }
          }

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
          const statusCode = error.response?.data?.statusCode;

          // Only set local error if not already handled by global toast (429/500)
          if (!error.isHandled) {
            set({ error: errorMessage, isLoading: false });
          } else {
            set({ isLoading: false });
          }

          if (statusCode === 'ACCOUNT_SUSPENDED' || statusCode === 'ACCOUNT_BANNED') {
            const errObj = new Error(error.response.data.message);
            errObj.isHandled = false; // Let it show in UI
            set({ isLoading: false, error: error.response.data.message });
            return {
              success: false,
              error: error.response.data.message,
              isAccountRestricted: true
            };
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
      // Handle Google OAuth callback — set role and fetch profile
      handleGoogleCallback: async (role) => {
        set({ isLoading: true, error: null });
        try {
          const roleResult = await setGoogleRole(role);

          if (!roleResult.success) {
            set({ isLoading: false });
            return { success: false, error: roleResult.message, existingRole: roleResult.existingRole };
          }

          // Fetch the user profile
          const profileResult = await get().fetchProfile(role);
          set({ isLoading: false });
          return { success: true, role: roleResult.role, isExisting: roleResult.isExisting, user: profileResult?.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Google sign-in failed. Please try again.';
          const existingRole = error.response?.data?.existingRole;
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage, existingRole };
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
              // Only logout if both returned 401 (Invalid Session)
              // If one returned 403/404, it might just be a role mismatch or missing profile, not invalid authentication
              const isValidSessionError = (status) => status === 401 || status === 403;
              const recStatus = recErr.response?.status;
              const empStatus = empErr.response?.status;

              // If both failed with auth-related errors, clear the session
              const isRestricted = (err) =>
                err.response?.status === 401 ||
                err.response?.data?.statusCode === 'ACCOUNT_SUSPENDED' ||
                err.response?.data?.statusCode === 'ACCOUNT_BANNED';

              if (isRestricted(recErr) && isRestricted(empErr)) {
                set({ user: null, isAuthenticated: false, error: errorMessage, isLoading: false });
              } else {
                set({ isLoading: false });
              }
              return { success: false, error: errorMessage };
            }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch profile.';
          const statusCode = error.response?.data?.statusCode;
          const status = error.response?.status;

          if (status === 401 || statusCode === 'ACCOUNT_SUSPENDED' || statusCode === 'ACCOUNT_BANNED') {
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
          // Reset auth state and account restricted flag
          resetAccountRestrictedFlag();
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
