'use client';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Ban, 
  TrendingUp,
  MapPin,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShieldCheck,
  Zap,
  Activity,
  AlertCircle,
  MoreHorizontal,
  Lock,
  Clock,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid
} from 'recharts';
import { adminAPI } from '@/lib/api';
import StatCard from '@/components/admin/StatCard';
import { NeoCard } from '@/components/ui/neo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#54A0FF', '#2DCC70', '#FFCC00', '#FF90E8', '#FF4D4D'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-zinc-800 border-b-4 border-neo-black dark:border-white"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 border-4 border-neo-black"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] bg-gray-200 dark:bg-zinc-800 border-4 border-neo-black"></div>
          <div className="h-[400px] bg-gray-200 dark:bg-zinc-800 border-4 border-neo-black"></div>
        </div>
      </div>
    );
  }

  const userChartData = [
    { name: 'Candidates', value: stats?.user?.candidates || 0 },
    { name: 'Recruiters', value: stats?.user?.recruiters || 0 },
  ];

  const appChartData = Object.entries(stats?.applications?.statusBreakDown || {}).map(([key, value]) => ({
    name: key.toUpperCase(),
    value
  }));

  const hasUserData = userChartData.some(d => d.value > 0);
  const hasAppData = appChartData.some(d => d.value > 0);

  return (
    <div className="space-y-4 pb-4">
      {/* Dashboard Header */}
      <div className="relative group p-1 bg-neo-black dark:bg-white overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        <div className="bg-white dark:bg-zinc-900 px-4 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-neo-black/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black flex items-center justify-center">
                 <Activity className="w-4 h-4 text-neo-black" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Monitoring Active</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-none">
                Admin <span className="text-neo-blue">Dashboard</span>
              </h1>
              <p className="font-mono text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                Welcome back, {stats?.user?.total} total verified users online.
              </p>
            </div>
          </div>
          
          <div className="flex items-stretch gap-2 h-12 md:h-16">
             <div className="bg-neo-black dark:bg-zinc-800 text-white px-4 md:px-6 border-2 border-neo-black dark:border-white shadow-[2px_2px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000] flex flex-col justify-center min-w-[100px] md:min-w-[120px]">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Total Users</span>
                <span className="text-2xl md:text-3xl font-black leading-none">{stats?.user?.total || 0}</span>
             </div>

             <button className="mock-btn bg-neo-blue text-white px-4 md:px-6 border-2 border-neo-black font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-[2px_2px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 md:gap-3" data-tooltip="Coming Soon">
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">SET</span>
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard 
          title="Users" 
          value={stats?.user?.total || 0} 
          icon={Users} 
          color="blue"
          trend={stats?.user?.total > 0 ? Math.round((stats?.user?.newThisWeek / (stats?.user?.total || 1)) * 100) : 0} 
          description="Verified members"
        />
        <StatCard 
          title="Jobs" 
          value={stats?.jobs?.active || 0} 
          icon={Briefcase} 
          color="green" 
          trend={stats?.jobs?.total > 0 ? Math.round((stats?.jobs?.postedThisWeek / (stats?.jobs?.total || 1)) * 100) : 0}
          description="Live listings"
        />
        <StatCard 
          title="Apps" 
          value={stats?.applications?.total || 0} 
          icon={FileText} 
          color="yellow"
          trend={stats?.applications?.total > 0 ? Math.round((stats?.applications?.thisWeek / (stats?.applications?.total || 1)) * 100) : 0} 
          description="Total applies"
        />
        <StatCard 
          title="Banned" 
          value={stats?.user?.suspended || 0} 
          icon={Ban} 
          color="red" 
          description="Flagged review"
        />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
          <div className="p-5 border-b-2 border-neo-black dark:border-white flex items-center justify-between bg-neo-blue/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-neo-black bg-neo-blue flex items-center justify-center">
                <Users className="w-5 h-5 text-neo-black stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neo-black dark:text-white leading-none">User Distribution</h3>
                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Comparison of Candidates vs Recruiters</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-[260px] relative mb-6">
              {!hasUserData && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-6 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-gray-400">No data Available</span>
                </div>
              )}
              {hasMounted && (
                <ResponsiveContainer id="chart-user-dist" width="100%" height={260} minWidth={0} debounce={10}>
                  <BarChart data={userChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.05} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: '900', className: 'fill-neo-black dark:fill-white uppercase font-mono' }} 
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888', fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #fff', 
                        borderRadius: '0', 
                        boxShadow: '3px 3px_0px_0px rgba(0,0,0,1)',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
                      itemStyle={{ color: '#54A0FF', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="value" stroke="#000" strokeWidth={2}>
                      {userChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#54A0FF' : '#FF90E8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-zinc-800">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-gray-500">
                  <div className="flex items-center gap-4">
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-blue"></div> {userChartData[0].value} Candidates</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-pink"></div> {userChartData[1].value} Recruiters</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
          <div className="p-5 border-b-2 border-neo-black dark:border-white flex items-center justify-between bg-neo-green/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-neo-black bg-neo-green flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                <FileText className="w-5 h-5 text-neo-black stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neo-black dark:text-white leading-none">Application Status</h3>
                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Breakdown by current state</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="h-[260px] relative mb-6">
              {!hasAppData && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-6 text-center">
                  <Activity className="w-10 h-10 text-gray-300 mb-2" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-gray-400">No Application Data</span>
                </div>
              )}
              {hasMounted && (
                <ResponsiveContainer id="chart-app-status" width="100%" height={260} minWidth={0} debounce={10}>
                  <PieChart>
                    <Pie
                      data={appChartData.length > 0 ? appChartData : [{ name: 'EMPTY', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={2}
                    >
                      {appChartData.length > 0 ? appChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      )) : (
                        <Cell fill="#f3f4f6" />
                      )}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '2px solid #fff', 
                        borderRadius: '0', 
                        boxShadow: '3px 3px_0px_0px rgba(0,0,0,1)',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' }}
                      itemStyle={{ color: '#54A0FF', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Legend 
                      iconType="rect" 
                      verticalAlign="bottom" 
                      wrapperStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '9px', paddingTop: '15px', letterSpacing: '0.05em' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="pt-4 border-t-2 border-dashed border-gray-100 dark:border-zinc-800">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-gray-500">
                  <div className="flex items-center gap-2">
                     <TrendingUp className="w-3.5 h-3.5 text-neo-green" />
                     <span>Success Rate: {Math.round((appChartData.find(d => d.name === 'ACCEPTED')?.value || 0) / (stats?.applications?.total || 1) * 100)}%</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* System Status Feed */}
         <div className="lg:col-span-1 bg-neo-black text-white border-2 border-neo-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col min-h-[320px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-neo-green" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Activity Feed</span>
               </div>
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neo-green animate-pulse"></div>
               </div>
            </div>
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
               <Clock className="w-10 h-10 text-neo-green/40 mx-auto" strokeWidth={1} />
               <div>
                  <p className="font-mono text-[10px] uppercase font-black tracking-widest text-neo-green">Monitoring System Events</p>
                  <p className="text-[9px] text-gray-500 uppercase mt-2">Waiting for live data packets from the server...</p>
               </div>
            </div>
            <div className="p-4 bg-white/5 text-[8px] font-bold text-gray-500 uppercase tracking-widest flex justify-between">
               <span>Input: Active Session</span>
               <span className="animate-pulse">_</span>
            </div>
         </div>

         {/* Security Insight */}
         <div className="lg:col-span-2 bg-neo-yellow border-2 border-neo-black p-8 shadow-[6px_6px_0px_0px_#000] relative group overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <ShieldCheck className="w-32 h-32 -rotate-12" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-neo-black flex items-center justify-center">
                     <Lock className="w-4 h-4 text-neo-yellow" />
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-neo-black">Access Security Module</span>
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight text-neo-black mb-3 leading-tight max-w-xl">
                  Automated profile verification is currently monitoring the platform
               </h3>
               <p className="font-bold text-neo-black/60 leading-relaxed max-w-2xl text-[10px] uppercase tracking-wider mb-6">
                  The system is actively monitoring user registrations and job postings to ensure platform integrity and security.
               </p>
               <div className="flex flex-wrap gap-4">
                  <button className="mock-btn bg-neo-black text-white px-6 py-3 font-black uppercase tracking-widest text-[10px] border-2 border-neo-black shadow-[4px_4px_0px_0px_white] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" data-tooltip="Coming Soon">
                     View User Logs
                  </button>
                  <button className="mock-btn bg-white text-neo-black px-6 py-3 font-black uppercase tracking-widest text-[10px] border-2 border-neo-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" data-tooltip="Coming Soon">
                     System Audit
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
