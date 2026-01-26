'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Building2, 
  MapPin, 
  Users, 
  Trash2, 
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  ShieldCheck,
  LayoutGrid,
  List,
  X,
  Activity,
  Zap,
  Briefcase,
  Globe
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1
  });

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getJobs(filters);
      if (response.success) {
        setJobs(response.data);
        setPagination({
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const response = await adminAPI.updateJobStatus(jobId, { status: newStatus });
      if (response.success) {
        setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    try {
      const response = await adminAPI.deleteJob(jobId);
      if (response.success) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  return (
    <div className="space-y-4 pb-4 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-neo-black dark:border-white pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-neo-black" />
             </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-none">
                  Job <span className="text-neo-blue">Listings</span>
                </h1>
                <p className="font-mono text-[8px] md:text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest flex items-center gap-2">
                  {pagination.total} Opening Found
                </p>
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <NeoStat label="TOTAL" value={pagination.total} color="blue" />
           <button className="mock-btn bg-neo-yellow text-neo-black px-4 md:px-6 py-2 md:py-3 border-2 border-neo-black font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-[2.5px_2.5px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" data-tooltip="Coming Soon">
              + NEW JOB
           </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        <div className="flex-1 relative group bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[3px_3px_0px_0px_#000]">
          <div className="h-full flex items-center px-4 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text"
              placeholder="Search by title or company..."
              className="flex-1 bg-transparent border-none outline-none font-bold text-xs dark:text-white placeholder:text-gray-300"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
            {filters.search && (
              <button onClick={() => setFilters(prev => ({ ...prev, search: '' }))} className="p-1">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="flex bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-0.5 shadow-[3px_3px_0px_0px_#000]">
           {[
             { label: 'ALL', val: '' },
             { label: 'ACTIVE', val: 'Active' },
             { label: 'CLOSED', val: 'Closed' }
           ].map((btn) => (
             <button 
               key={btn.val}
               onClick={() => setFilters(prev => ({ ...prev, status: btn.val, page: 1 }))}
               className={cn(
                 "px-4 py-1.5 font-black text-[9px] uppercase tracking-widest transition-all",
                 filters.status === btn.val 
                   ? "bg-neo-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]" 
                   : "text-gray-500 hover:text-neo-black dark:hover:text-white"
               )}
             >
               {btn.label}
             </button>
           ))}
        </div>

        <div className="hidden sm:flex bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-0.5 shadow-[3px_3px_0px_0px_#000]">
           <button onClick={() => setViewMode('grid')} className={cn("p-1.5 transition-all text-[10px]", viewMode === 'grid' ? "bg-neo-blue text-white shadow-[1px_1px_0px_0px_#000]" : "text-gray-400")}>
             <LayoutGrid className="w-4 h-4" />
           </button>
           <button onClick={() => setViewMode('list')} className={cn("p-1.5 transition-all text-[10px]", viewMode === 'list' ? "bg-neo-blue text-white shadow-[1px_1px_0px_0px_#000]" : "text-gray-400")}>
             <List className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-60 bg-gray-50 dark:bg-zinc-900 border-2 border-neo-black animate-pulse shadow-[3px_3px_0px_0px_#000]"></div>
            ))
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job._id} className="relative group bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white flex flex-col hover:-translate-y-0.5 transition-all duration-300 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] hover:shadow-[7px_7px_0px_0px_rgba(84,160,255,0.4)] overflow-hidden">
                {/* Compact Status Tag */}
                <div className={cn(
                  "absolute top-0 right-0 px-4 py-2 border-l-2 border-b-2 border-neo-black font-black text-[10px] uppercase tracking-widest z-20",
                  job.status === 'Active' ? "bg-neo-green text-neo-black" : "bg-neo-red text-white"
                )}>
                  {job.status}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-neo-black bg-neo-yellow flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                        <Building2 className="w-6 h-6 text-neo-black" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-neo-black border border-white rounded-full flex items-center justify-center">
                        <div className={cn("w-1.5 h-1.5 rounded-full", job.status === 'Active' ? "bg-neo-green animate-pulse" : "bg-neo-red")}></div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                       <button 
                         className={cn(
                           "p-2.5 border-2 border-neo-black transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none", 
                           job.status === 'Active' ? "bg-neo-orange hover:bg-neo-red text-white" : "bg-neo-green hover:bg-neo-blue text-neo-black"
                         )} 
                         onClick={() => handleStatusUpdate(job._id, job.status === 'Active' ? 'Closed' : 'Active')}
                         title={job.status === 'Active' ? "Close Job" : "Activate Job"}
                       >
                         {job.status === 'Active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                       </button>

                       <button 
                         className="p-2.5 border-2 border-neo-black bg-white dark:bg-zinc-800 dark:text-white hover:bg-neo-red hover:text-white transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" 
                         onClick={() => handleDeleteJob(job._id)}
                         title="Delete Job"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight text-neo-black dark:text-white leading-tight">
                       {job.title}
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-black text-neo-blue uppercase tracking-widest flex items-center gap-1.5">
                         <Briefcase className="w-3 h-3" /> {job.companyName}
                       </span>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4 p-4 bg-neo-black/5 dark:bg-white/5 border border-neo-black/10 dark:border-white/10 rounded-sm">
                     <div className="space-y-2">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Applies</span>
                           <Users className="w-3 h-3 text-neo-blue" />
                        </div>
                        <span className="text-lg font-black dark:text-white leading-none">{job.applicationCount || 0}</span>
                     </div>
                     <div className="space-y-2 border-l border-gray-200 dark:border-zinc-800 pl-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Where</span>
                           <MapPin className="w-3 h-3 text-neo-pink" />
                        </div>
                        <span className="text-[11px] font-black dark:text-white block truncate leading-none pt-1">{job.location}</span>
                     </div>
                  </div>
                </div>

                <div className="flex h-12 border-t border-neo-black dark:border-white bg-neo-black text-white p-1">
                   <div className="flex-1 px-4 flex items-center font-mono text-[10px] uppercase font-black tracking-widest text-gray-300 border border-white/5 gap-4">
                     <span className="text-neo-blue">#{job._id.slice(-6).toUpperCase()}</span>
                     <span className="opacity-20">|</span>
                     <span>POSTED: {formatDate(job.createdAt)}</span>
                   </div>
                   <div className="w-10 bg-neo-yellow flex items-center justify-center border-l border-neo-black">
                      <Clock className="w-4 h-4 text-neo-black" />
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-neo-black/10 dark:border-white/10 rounded-lg">
               <AlertCircle className="w-12 h-12 text-gray-200 dark:text-zinc-800 mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest text-gray-400 text-xs">No records detected</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_#000] overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-neo-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[9px]">
                    <th className="p-3">Job Title</th>
                    <th className="p-3">Company</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Applies</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-neo-black/5 dark:divide-white/5 font-bold text-[10px] uppercase">
                 {jobs.map(job => (
                    <tr key={job._id} className="hover:bg-neo-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-neo-black dark:text-white group">
                       <td className="p-4 flex items-center gap-3">
                          <div className={cn(
                            "w-1 h-6 transition-all group-hover:h-8",
                            job.status === 'Active' ? "bg-neo-green" : "bg-neo-red"
                          )}></div>
                          <div>
                            <div className="text-[11px] font-black">{job.title}</div>
                            <div className="text-[8px] text-gray-400 font-mono">ID: {job._id.slice(-6).toUpperCase()}</div>
                          </div>
                       </td>
                       <td className="p-4 font-black">
                          <div className="flex items-center gap-2">
                             <Briefcase className="w-3 h-3 text-neo-blue" />
                             {job.companyName}
                          </div>
                       </td>
                       <td className="p-4 text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                             <MapPin className="w-3 h-3 text-neo-pink" />
                             {job.location}
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <Users className="w-3 h-3 text-neo-blue" />
                             {job.applicationCount}
                          </div>
                       </td>
                       <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 border-2 border-neo-black text-[8px] font-black shadow-[2px_2px_0px_0px_#000] inline-block", 
                            job.status === 'Active' ? "bg-neo-green text-neo-black" : "bg-neo-red text-white"
                          )}>{job.status}</span>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => handleStatusUpdate(job._id, job.status === 'Active' ? 'Closed' : 'Active')} 
                               className={cn(
                                 "p-2 border-2 border-neo-black transition-all shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
                                 job.status === 'Active' ? "bg-neo-orange hover:bg-neo-yellow" : "bg-neo-green hover:bg-neo-blue"
                               )}
                               title={job.status === 'Active' ? "Close Job" : "Activate Job"}
                             >
                               <Power className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleDeleteJob(job._id)} 
                               className="p-2 border-2 border-neo-black bg-white hover:bg-neo-red hover:text-white transition-all shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                               title="Delete Job"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t-2 border-neo-black dark:border-white">
        <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">
          Showing {jobs.length} / {pagination.total} entries
        </div>
        
        <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border-2 border-neo-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 transition-all active:translate-x-0.5" disabled={filters.page === 1} onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}>
              <ChevronLeft className="w-4 h-4 dark:text-white" />
            </button>
            <div className="h-10 px-6 flex items-center justify-center bg-neo-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[10px] border-2 border-neo-black shadow-[2px_2px_0px_0px_#000]">
               {filters.page} / {pagination.totalPages}
            </div>
            <button className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border-2 border-neo-black shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 transition-all active:translate-x-0.5" disabled={filters.page === pagination.totalPages} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}>
              <ChevronRight className="w-4 h-4 dark:text-white" />
            </button>
        </div>
      </div>
    </div>
  );
}

function NeoStat({ label, value, color }) {
  return (
    <div className="bg-neo-black dark:bg-zinc-800 text-white px-5 py-2 border-2 border-neo-black shadow-[2px_2px_0px_0px_#000] flex flex-col justify-center min-w-[100px]">
      <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 leading-none mb-1">{label}</span>
      <span className="text-lg font-black leading-none">{value}</span>
    </div>
  );
}
