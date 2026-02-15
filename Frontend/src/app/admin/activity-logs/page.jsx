'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  Search,
  Filter,
  Clock,
  User as UserIcon,
  Globe,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  Server,
  Shield,
  Zap,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { NeoModal, NeoButton, NeoCard } from '@/components/ui/neo';
import { useToast } from '@/lib/toastStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const METHOD_COLORS = {
  POST: 'bg-neo-green text-neo-black',
  PUT: 'bg-neo-blue text-white',
  PATCH: 'bg-neo-yellow text-neo-black',
  DELETE: 'bg-neo-red text-white',
};

const ROLE_COLORS = {
  employee: 'bg-neo-blue text-white',
  recruiter: 'bg-neo-yellow text-neo-black',
  admin: 'bg-neo-pink text-white',
  system: 'bg-gray-700 text-white',
};

const STATUS_COLORS = {
  success: 'bg-neo-green',
  redirect: 'bg-neo-blue',
  clientError: 'bg-neo-yellow',
  serverError: 'bg-neo-red',
};

function getStatusCategory(code) {
  if (!code) return null;
  if (code < 300) return 'success';
  if (code < 400) return 'redirect';
  if (code < 500) return 'clientError';
  return 'serverError';
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeRange, setPurgeRange] = useState(30);
  const [isPurging, setIsPurging] = useState(false);
  const { addToast } = useToast();
  const [filters, setFilters] = useState({
    search: '',
    userRole: '',
    method: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const fetchLogs = useCallback(async () => {
    try {
      const params = { ...filters };
      // Clean empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      const response = await adminAPI.getActivityLogs(params);
      if (response.success) {
        setLogs(response.data);
        setPagination({
          total: response.pagination.totalLogs,
          totalPages: response.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminAPI.getActivityStats(7);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setIsLoading(false);
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setIsRefreshing(false);
  };

  const handleDeleteOldLogs = async () => {
    setIsPurging(true);
    try {
      const response = await adminAPI.deleteActivityLogs(purgeRange);
      if (response.success) {
        addToast(response.message || `Successfully purged logs`, 'success');
        handleRefresh();
      } else {
        addToast(response.message || 'Failed to purge logs', 'error');
      }
    } catch (error) {
      console.error('Failed to delete logs:', error);
      addToast('Network error while purging logs', 'error');
    } finally {
      setIsPurging(false);
      setShowPurgeModal(false);
    }
  };

  // Get top 3 actions from stats
  const topActions = stats?.actionBreakdown?.slice(0, 3) || [];

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-neo-black dark:border-white pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-none">
            Activity <span className="text-neo-green">Logs</span>
          </h1>
          <p className="font-mono text-[8px] md:text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Tracking {pagination.total} Events
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={handleRefresh}
            className={cn(
              "p-2 border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-900 shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all",
              isRefreshing && "animate-spin"
            )}
          >
            <RefreshCw className="w-4 h-4 dark:text-white" />
          </button>
          <button
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2 border-2 border-neo-black bg-neo-red text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NeoCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-neo-green border-2 border-neo-black flex items-center justify-center shadow-neo-sm">
                <Zap className="w-3.5 h-3.5 text-neo-black" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total (7D)</span>
            </div>
            <div className="text-2xl font-black text-neo-black dark:text-white">{stats.totalLogs}</div>
          </NeoCard>

          {topActions
            .sort((a, b) => b.count - a.count || a._id.localeCompare(b._id))
            .map((action, i) => {
              const getActionResource = (id) => {
                if (id.includes('AUTO_APPLY')) return { icon: Server, color: 'bg-neo-blue' };
                if (id.includes('TALENT_RADAR')) return { icon: Shield, color: 'bg-neo-yellow' };
                return { icon: BarChart3, color: 'bg-neo-pink' };
              };
              const { icon: Icon, color } = getActionResource(action._id);

              return (
                <NeoCard key={action._id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-7 h-7 border-2 border-neo-black flex items-center justify-center shadow-neo-sm", color)}>
                      <Icon className="w-3.5 h-3.5 text-neo-black" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 truncate">{action._id.replace(/_/g, ' ').slice(0, 18)}</span>
                  </div>
                  <div className="text-2xl font-black text-neo-black dark:text-white">{action.count}</div>
                </NeoCard>
              );
            })}
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[3px_3px_0px_0px_#000] focus-within:shadow-[5px_5px_0px_0px_#000] transition-all">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-neo-green transition-colors" />
            <input
              type="text"
              placeholder="SEARCH LOGS BY DESCRIPTION..."
              className="w-full bg-transparent p-3 pl-11 font-black uppercase tracking-tight outline-none text-[10px] md:text-xs placeholder:text-gray-300 dark:text-white"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-0.5 shadow-[3px_3px_0px_0px_#000]">
              {[
                { label: 'ALL', val: '' },
                { label: 'EMPLOYEE', val: 'employee' },
                { label: 'RECRUITER', val: 'recruiter' },
                { label: 'ADMIN', val: 'admin' },
                { label: 'SYSTEM', val: 'system' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setFilters(prev => ({ ...prev, userRole: btn.val, page: 1 }))}
                  className={cn(
                    "px-2.5 py-1.5 font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all",
                    filters.userRole === btn.val
                      ? "bg-neo-green text-neo-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                      : "text-gray-400 hover:text-neo-black dark:hover:text-white"
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <div className="flex bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-0.5 shadow-[3px_3px_0px_0px_#000]">
              {[
                { label: 'ALL', val: '' },
                { label: 'POST', val: 'POST' },
                { label: 'PUT', val: 'PUT' },
                { label: 'PATCH', val: 'PATCH' },
                { label: 'DELETE', val: 'DELETE' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setFilters(prev => ({ ...prev, method: btn.val, page: 1 }))}
                  className={cn(
                    "px-2.5 py-1.5 font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all",
                    filters.method === btn.val
                      ? "bg-neo-blue text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                      : "text-gray-400 hover:text-neo-black dark:hover:text-white"
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Clear */}
            {(filters.search || filters.userRole || filters.method) && (
              <button
                onClick={() => setFilters({ search: '', userRole: '', method: '', page: 1, limit: 20 })}
                className="p-2 border-2 border-neo-black bg-neo-red text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                title="Clear Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-900">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-neo-black text-white dark:bg-white dark:text-black border-b-2 border-neo-black">
              <th className="p-3 font-black uppercase tracking-widest text-[10px] w-[180px]">Action</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px]">Description</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px] hidden md:table-cell w-[100px]">Role</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px] hidden lg:table-cell w-[80px]">Method</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px] hidden lg:table-cell w-[80px]">Status</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px] w-[100px]">Time</th>
              <th className="p-3 font-black uppercase tracking-widest text-[10px] hidden md:table-cell w-[100px]">IP</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="7" className="p-4 border-b border-neo-black/5 dark:border-white/5">
                    <div className="h-5 bg-gray-100 dark:bg-zinc-800 w-full"></div>
                  </td>
                </tr>
              ))
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <React.Fragment key={log._id}>
                  <tr
                    className="hover:bg-neo-black/5 dark:hover:bg-white/5 border-b border-neo-black/5 dark:border-white/5 transition-colors cursor-pointer group"
                    onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          log.statusCode ? STATUS_COLORS[getStatusCategory(log.statusCode)] : 'bg-gray-400'
                        )} />
                        <span className="font-black uppercase tracking-tight text-[9px] md:text-[10px] text-neo-black dark:text-white break-all md:break-words">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] text-gray-600 dark:text-gray-300 font-mono break-words block">
                        {log.description}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {log.userRole && (
                        <span className={cn(
                          "inline-block px-1.5 py-0.5 border border-neo-black text-[8px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]",
                          ROLE_COLORS[log.userRole] || 'bg-gray-200 text-gray-800'
                        )}>
                          {log.userRole}
                        </span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {log.method && (
                        <span className={cn(
                          "inline-block px-1.5 py-0.5 border border-neo-black text-[8px] font-black uppercase shadow-[1px_1px_0px_0px_#000]",
                          METHOD_COLORS[log.method] || 'bg-gray-200 text-gray-800'
                        )}>
                          {log.method}
                        </span>
                      )}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {log.statusCode && (
                        <span className={cn(
                          "inline-block px-1.5 py-0.5 border border-neo-black text-[8px] font-black shadow-[1px_1px_0px_0px_#000]",
                          STATUS_COLORS[getStatusCategory(log.statusCode)] || 'bg-gray-200',
                          getStatusCategory(log.statusCode) === 'success' ? 'text-neo-black' : 'text-white'
                        )}>
                          {log.statusCode}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                        <Clock className="w-3 h-3 shrink-0" />
                        {timeAgo(log.createdAt)}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-mono">
                        <Globe className="w-3 h-3" />
                        {log.ipAddress || '—'}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedLog === log._id && (
                    <tr className="bg-neo-black/[0.02] dark:bg-white/[0.02]">
                      <td colSpan="7" className="p-4 border-b border-neo-black/10 dark:border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px]">
                          <div>
                            <span className="font-black uppercase tracking-widest text-gray-400 text-[8px]">Endpoint</span>
                            <p className="font-mono text-neo-black dark:text-white mt-1 flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3 text-neo-green" />
                              {log.endpoint || '—'}
                            </p>
                          </div>
                          <div>
                            <span className="font-black uppercase tracking-widest text-gray-400 text-[8px]">User ID</span>
                            <p className="font-mono text-neo-black dark:text-white mt-1 flex items-center gap-1">
                              <UserIcon className="w-3 h-3 text-neo-blue" />
                              {log.userId || 'System'}
                            </p>
                          </div>
                          <div>
                            <span className="font-black uppercase tracking-widest text-gray-400 text-[8px]">Resource</span>
                            <p className="font-mono text-neo-black dark:text-white mt-1">
                              {log.resourceType ? `${log.resourceType} / ${log.resourceId}` : '—'}
                            </p>
                          </div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="md:col-span-3">
                              <span className="font-black uppercase tracking-widest text-gray-400 text-[8px]">Metadata</span>
                              <pre className="font-mono text-[9px] text-gray-600 dark:text-gray-300 mt-1 bg-neo-black/5 dark:bg-white/5 p-3 border border-neo-black/10 dark:border-white/10 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Activity className="w-10 h-10 text-gray-200" />
                    <p className="font-black uppercase tracking-widest text-gray-400 text-xs">No Logs Found</p>
                    <p className="text-[9px] font-mono text-gray-300">Try adjusting your filters</p>
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
          Showing: {logs.length} / {pagination.total} events
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
            {filters.page} / {pagination.totalPages || 1}
          </div>
          <button
            className="p-2 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 transition-all active:translate-x-0.5"
            disabled={filters.page >= pagination.totalPages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4 dark:text-white" />
          </button>
        </div>
      </div>

      <NeoModal isOpen={showPurgeModal} onClose={() => setShowPurgeModal(false)} title="Select Purge Range" maxWidth="max-w-sm">
        <div className="space-y-6">
          <div className="bg-neo-red/10 border-2 border-neo-red p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-neo-red shrink-0" />
            <p className="text-xs font-bold text-neo-red uppercase tracking-tight">Warning: This action will permanently remove activity history and cannot be recovered.</p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Purge Threshold</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Older than 30 Days', val: 30 },
                { label: 'Older than 7 Days', val: 7 },
                { label: 'Older than 24 Hours', val: 1 },
                { label: 'Delete All History', val: 0 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setPurgeRange(opt.val)}
                  className={cn(
                    "w-full p-3 border-2 text-left font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-between",
                    purgeRange === opt.val
                      ? "bg-neo-black text-white border-neo-black shadow-neo-sm"
                      : "bg-white border-neo-black/10 hover:border-neo-black"
                  )}
                >
                  {opt.label}
                  {purgeRange === opt.val && <div className="w-2 h-2 bg-neo-yellow rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <NeoButton onClick={() => setShowPurgeModal(false)} variant="secondary" className="flex-1">CANCEL</NeoButton>
            <NeoButton onClick={handleDeleteOldLogs} disabled={isPurging} variant="danger" className="flex-1">
              {isPurging ? 'PURGING...' : 'CONFIRM PURGE'}
            </NeoButton>
          </div>
        </div>
      </NeoModal>
    </div>
  );
}
