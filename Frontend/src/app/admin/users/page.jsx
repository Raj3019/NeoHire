'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Ban,
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { NeoCard, NeoButton, NeoBadge, NeoInput } from '@/components/ui/neo';
import { formatDate } from '@/lib/utils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// Simplified action menu to avoid missing dependency

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    range: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getUsers(filters);
      if (response.success) {
        setUsers(response.data);
        setPagination({
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusUpdate = async (userId, userType, newStatus) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, { userType, status: newStatus });
      if (response.success) {
        // Update local state
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-neo-green text-neo-black';
      case 'Suspended': return 'bg-neo-yellow text-neo-black';
      case 'Banned': return 'bg-neo-red text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-neo-black dark:border-white pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-none">
            User <span className="text-neo-pink">Management</span>
          </h1>
          <p className="font-mono text-[8px] md:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center gap-2">
            Managing {pagination.total} Identities
          </p>
        </div>

        <div className="flex gap-2 md:gap-3">
          <NeoButton variant="secondary" className="mock-btn text-[9px] md:text-[10px] px-3 md:px-5 py-1.5 md:py-2" data-tooltip="Coming Soon">
            EXPORT
          </NeoButton>
          <NeoButton className="mock-btn text-[9px] md:text-[10px] px-3 md:px-5 py-1.5 md:py-2" data-tooltip="Coming Soon">
            + NEW
          </NeoButton>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-neo-black transition-colors" />
          <input
            type="text"
            placeholder="Identity scan: name or email hash..."
            className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 pl-10 font-bold uppercase tracking-tight shadow-[3px_3px_0px_0px_#000] focus:shadow-[5px_5px_0px_0px_#000] transition-all outline-none text-xs placeholder:text-gray-300 dark:text-white"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-[3px_3px_0px_0px_#000] appearance-none cursor-pointer outline-none hover:bg-neo-blue/10 dark:text-white"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
          >
            <option value="">TYPE: ALL</option>
            <option value="candidate">TALENT_POOL</option>
            <option value="recruiter">RECRUITERS</option>
            <option value="admin">ADMINS</option>
          </select>

          <select
            className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-[3px_3px_0px_0px_#000] appearance-none cursor-pointer outline-none hover:bg-neo-yellow/10 dark:text-white"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="">STATUS: ALL</option>
            <option value="Active">OK_ACTIVE</option>
            <option value="Suspended">PENDING</option>
            <option value="Banned">TERMINATED</option>
          </select>

          <select
            className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white px-4 py-2 font-black uppercase tracking-widest text-[10px] shadow-[3px_3px_0px_0px_#000] appearance-none cursor-pointer outline-none hover:bg-neo-pink/10 dark:text-white"
            value={filters.range}
            onChange={(e) => setFilters(prev => ({ ...prev, range: e.target.value, page: 1 }))}
          >
            <option value="">TIME: ALL</option>
            <option value="week">LAST_7_DAYS</option>
            <option value="month">LAST_30_DAYS</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-900">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-neo-black text-white dark:bg-white dark:text-black border-b-2 border-neo-black">
              <th className="p-3 font-black uppercase tracking-widest text-[10px]">User</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px]">Email</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px]">Location</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px]">Status</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="p-4 border-b border-neo-black/5 dark:border-white/5">
                    <div className="h-6 bg-gray-100 dark:bg-zinc-800 w-full mb-1"></div>
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-neo-black/5 dark:hover:bg-white/5 border-b border-neo-black/5 dark:border-white/5 transition-colors group">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        <div className="w-10 h-10 border-2 border-neo-black bg-neo-blue flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_#000]">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-neo-black" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-black uppercase tracking-tight text-xs text-neo-black dark:text-white leading-none">
                          {user.fullName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {user.userType === 'admin' ? (
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-violet-600 border border-neo-black text-[8px] font-black uppercase leading-none text-white shadow-[1px_1px_0px_0px_#000]">Admin</span>
                          ) : user.userType === 'recruiter' ? (
                            <span className="px-1 py-0.5 bg-neo-yellow border border-neo-black text-[8px] font-black uppercase leading-none">Recruiter</span>
                          ) : (
                            <span className="px-1 py-0.5 bg-neo-blue border border-neo-black text-[8px] font-black uppercase leading-none text-white">Candidate</span>
                          )}
                          {user.currentEmployer && <span className="text-[9px] text-gray-400 font-mono truncate max-w-[80px]">@{user.currentEmployer}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-3 uppercase font-mono text-[10px]">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-neo-red" />
                      {user.country || 'Distributed'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "inline-block px-2 py-0.5 border-2 border-neo-black font-black text-[8px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]",
                      user.status === 'Active' ? 'bg-neo-green' : user.status === 'Suspended' ? 'bg-neo-yellow' : 'bg-neo-red text-white'
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Activate"
                        className="p-1.5 border-2 border-neo-black bg-neo-green hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                        onClick={() => handleStatusUpdate(user._id, user.userType, 'Active')}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-neo-black" />
                      </button>
                      <button
                        title="Suspend"
                        className="p-1.5 border-2 border-neo-black bg-neo-yellow hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                        onClick={() => handleStatusUpdate(user._id, user.userType, 'Suspended')}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-neo-black" />
                      </button>
                      <button
                        title="Ban"
                        className="p-1.5 border-2 border-neo-black bg-neo-red hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                        onClick={() => handleStatusUpdate(user._id, user.userType, 'Banned')}
                      >
                        <Ban className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Search className="w-10 h-10 text-gray-200" />
                    <p className="font-black uppercase tracking-widest text-gray-400 text-xs">0 Matches Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Synced: {users.length} / {pagination.total} records
        </div>
        <div className="flex gap-1.5">
          <button
            className="p-2 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 transition-all active:translate-x-0.5"
            disabled={filters.page === 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft className="w-4 h-4 dark:text-white" />
          </button>
          <div className="px-4 flex items-center justify-center bg-neo-black text-white dark:bg-white dark:text-black font-black leading-none border-2 border-neo-black py-2 text-xs">
            {filters.page} / {pagination.totalPages}
          </div>
          <button
            className="p-2 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 transition-all active:translate-x-0.5"
            disabled={filters.page === pagination.totalPages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
