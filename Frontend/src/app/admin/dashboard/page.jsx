'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Briefcase,
  FileText,
  Ban,
  TrendingUp,
  Activity,
  AlertCircle,
  ShieldCheck,
  Zap,
  Bot,
  Clock,
  Building2,
  Target,
  Radar,
  Bell,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
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
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { adminAPI } from '@/lib/api';
import StatCard from '@/components/admin/StatCard';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#54A0FF', '#2DCC70', '#FFCC00', '#FF90E8', '#FF4D4D'];
const STATUS_COLORS = {
  applied: '#54A0FF',
  pending: '#FFCC00',
  shortlist: '#2DCC70',
  accept: '#FF90E8',
  reject: '#FF4D4D'
};

const RANGE_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '15D', value: 15 },
  { label: '30D', value: 30 },
];

// Shared tooltip style for all charts
const tooltipStyle = {
  backgroundColor: '#000',
  border: '2px solid #fff',
  borderRadius: '0',
  boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
  padding: '8px 12px'
};
const tooltipLabelStyle = { color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', marginBottom: '4px' };
const tooltipItemStyle = { fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' };

// Chart Section wrapper component
function ChartSection({ title, subtitle, icon: Icon, iconBg, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="p-4 border-b-2 border-neo-black dark:border-white flex items-center gap-3 bg-neo-black/[0.02] dark:bg-white/[0.02]">
        <div className={cn("w-9 h-9 border-2 border-neo-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]", iconBg)}>
          <Icon className="w-4 h-4 text-neo-black stroke-[3]" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-neo-black dark:text-white leading-none">{title}</h3>
          <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [range, setRange] = useState(7);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchStats = useCallback(async () => {
    // Only show full skeleton on initial load, not filter changes
    if (stats) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const response = await adminAPI.getDashboard(range);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-zinc-800 border-2 border-neo-black"></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 border-2 border-neo-black"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[350px] bg-gray-200 dark:bg-zinc-800 border-2 border-neo-black"></div>
          <div className="h-[350px] bg-gray-200 dark:bg-zinc-800 border-2 border-neo-black"></div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userChartData = [
    { name: 'Candidates', value: stats?.user?.candidates || 0 },
    { name: 'Recruiters', value: stats?.user?.recruiters || 0 },
  ];

  const appStatusData = Object.entries(stats?.applications?.statusBreakDown || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: STATUS_COLORS[key] || '#888'
  }));

  const jobTypeData = Object.entries(stats?.jobs?.byJobType || {}).map(([key, value]) => ({
    name: key,
    value
  }));

  const workTypeData = Object.entries(stats?.jobs?.byWorkType || {}).map(([key, value]) => ({
    name: key,
    value
  }));

  const hasAppData = appStatusData.some(d => d.value > 0);
  const acceptedCount = stats?.applications?.statusBreakDown?.accept || 0;
  const acceptanceRate = stats?.applications?.total > 0 ? Math.round((acceptedCount / stats.applications.total) * 100) : 0;
  const avgAppsPerJob = stats?.jobs?.total > 0 ? (stats.applications.total / stats.jobs.total).toFixed(1) : '0';

  // Format date label for trend charts
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn("space-y-5 pb-6 transition-opacity duration-200", isRefreshing && "opacity-60")}>
      {/* Dashboard Header */}
      <div className="relative p-1 bg-neo-black dark:bg-white overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        <div className="bg-white dark:bg-zinc-900 px-4 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-neo-black/10">
          <div className="space-y-3">
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
                Welcome back, {stats?.user?.total} total verified users on platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 h-12 md:h-14">
            <div className="h-full bg-neo-black dark:bg-zinc-800 text-white px-4 md:px-6 border-2 border-neo-black dark:border-white shadow-[3px_3px_0px_0px_#000] flex flex-col justify-center min-w-[110px]">
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5 whitespace-nowrap">Total Global Users</span>
              <span className="text-2xl md:text-3xl font-black leading-none">{stats?.user?.total || 0}</span>
            </div>
            <button className="h-full bg-neo-blue text-white px-4 md:px-6 border-2 border-neo-black font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">System Settings</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Analytics Period</span>
          {isRefreshing && <div className="w-1.5 h-1.5 rounded-full bg-neo-blue animate-pulse"></div>}
        </div>
        <div className="flex bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-0.5 shadow-[3px_3px_0px_0px_#000]">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                "px-4 py-1.5 font-black text-[9px] uppercase tracking-widest transition-all",
                range === opt.value
                  ? "bg-neo-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                  : "text-gray-400 hover:text-neo-black dark:hover:text-white"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Stat Cards (3x3 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        <StatCard
          title="Global Candidates"
          value={stats?.user?.total || 0}
          subValue={`+${stats?.user?.newInRange || 0}`}
          icon={Users}
          color="blue"
          description="VERIFIED TALENT POOL"
        />
        <StatCard
          title="Active Openings"
          value={stats?.jobs?.active || 0}
          subValue="LIVE"
          icon={Briefcase}
          color="green"
          description="TOTAL MARKET LISTINGS"
        />
        <StatCard
          title="Total Applications"
          value={stats?.applications?.total || 0}
          subValue={`+${stats?.applications?.inRange || 0}`}
          icon={FileText}
          color="yellow"
          description="CANDIDATE SUBMISSIONS"
        />

        <StatCard
          title="Radar Opt-ins"
          value={stats?.talentRadar?.candidateOptIns || 0}
          subValue="OPTED-IN"
          icon={Radar}
          color="cyan"
          description="SEARCHABLE CANDIDATES"
        />
        <StatCard
          title="Talent Alerts"
          value={stats?.talentRadar?.recruiterAlerts || 0}
          subValue={`+${stats?.talentRadar?.newAlertsInRange || 0}`}
          icon={Bell}
          color="indigo"
          description="RECRUITER MONITORING"
        />
        <StatCard
          title="Success Rate"
          value={acceptanceRate}
          subValue="%"
          icon={Target}
          color="pink"
          description="OFFER ACCEPTANCE"
        />

        <StatCard
          title="Auto-Apply Adoption"
          value={stats?.applications?.autoApplyCount || 0}
          subValue="BOT"
          icon={Bot}
          color="purple"
          description="AUTOMATED SUBMISSIONS"
        />
        <StatCard
          title="High Urgency"
          value={stats?.jobs?.closingSoon || 0}
          subValue="7D"
          icon={Clock}
          color="orange"
          description="CLOSING THIS WEEK"
        />
        <StatCard
          title="System Security"
          value={stats?.user?.suspended || 0}
          subValue="FLAGGED"
          icon={Ban}
          color="red"
          description="RESTRICTED ACCOUNTS"
        />
      </div>

      {/* Row 2: Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <ChartSection title="Registration Trend" subtitle={`New signups over last ${range} days`} icon={TrendingUp} iconBg="bg-neo-blue">
          <div className="h-[250px]">
            {hasMounted && (
              <ResponsiveContainer width="100%" height={250} minWidth={0} debounce={10}>
                <AreaChart data={stats?.trends?.registrations || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCandidate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#54A0FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#54A0FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRecruiter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF90E8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF90E8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.05} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 8, fontWeight: '900', fill: '#999' }}
                    interval={range <= 7 ? 0 : range <= 15 ? 1 : 4}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999', fontWeight: 'bold' }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={formatDateLabel}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Area type="monotone" dataKey="candidates" stroke="#54A0FF" strokeWidth={2.5} fill="url(#gradCandidate)" name="Candidates" />
                  <Area type="monotone" dataKey="recruiters" stroke="#FF90E8" strokeWidth={2.5} fill="url(#gradRecruiter)" name="Recruiters" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="pt-3 border-t-2 border-dashed border-gray-100 dark:border-zinc-800 flex items-center gap-4 text-[9px] font-black uppercase tracking-tighter text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-blue"></div> Candidates</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-pink"></div> Recruiters</span>
            <span className="ml-auto">{stats?.user?.newInRange || 0} total new</span>
          </div>
        </ChartSection>

        {/* Application Trend */}
        <ChartSection title="Application Trend" subtitle={`Manual vs auto-apply over last ${range} days`} icon={FileText} iconBg="bg-neo-green">
          <div className="h-[250px]">
            {hasMounted && (
              <ResponsiveContainer width="100%" height={250} minWidth={0} debounce={10}>
                <AreaChart data={stats?.trends?.applications || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradManual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DCC70" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2DCC70" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAuto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.05} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 8, fontWeight: '900', fill: '#999' }}
                    interval={range <= 7 ? 0 : range <= 15 ? 1 : 4}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999', fontWeight: 'bold' }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={formatDateLabel}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
                  <Area type="monotone" dataKey="manual" stroke="#2DCC70" strokeWidth={2.5} fill="url(#gradManual)" name="Manual" />
                  <Area type="monotone" dataKey="autoApply" stroke="#a855f7" strokeWidth={2.5} fill="url(#gradAuto)" name="Auto-Apply" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="pt-3 border-t-2 border-dashed border-gray-100 dark:border-zinc-800 flex items-center gap-4 text-[9px] font-black uppercase tracking-tighter text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-green"></div> Manual</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500"></div> Auto-Apply</span>
            <span className="ml-auto">{stats?.applications?.inRange || 0} total</span>
          </div>
        </ChartSection>
      </div>

      {/* Row 3: User Distribution + Application Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7">
        {/* User Distribution Bar Chart */}
        <ChartSection title="User Distribution" subtitle="Candidates vs Recruiters" icon={Users} iconBg="bg-neo-blue">
          <div className="h-[220px]">
            {hasMounted && (
              <ResponsiveContainer width="100%" height={220} minWidth={0} debounce={10}>
                <BarChart data={userChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" opacity={0.05} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: '900', className: 'fill-neo-black dark:fill-white uppercase font-mono' }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888', fontWeight: 'bold' }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="value" stroke="#000" strokeWidth={2} name="Count">
                    {userChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#54A0FF' : '#FF90E8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="pt-3 border-t-2 border-dashed border-gray-100 dark:border-zinc-800 flex items-center gap-4 text-[9px] font-black uppercase tracking-tighter text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-blue"></div> {userChartData[0].value} Candidates</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-neo-pink"></div> {userChartData[1].value} Recruiters</span>
          </div>
        </ChartSection>

        {/* Application Pipeline */}
        <ChartSection title="Application Pipeline" subtitle="Status distribution breakdown" icon={Zap} iconBg="bg-neo-yellow">
          {hasAppData ? (
            <>
              {/* Stacked horizontal bar */}
              <div className="mb-4">
                <div className="h-10 flex border-2 border-neo-black overflow-hidden">
                  {appStatusData.map((status, i) => {
                    const total = appStatusData.reduce((sum, s) => sum + s.value, 0);
                    const pct = total > 0 ? (status.value / total) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={status.name}
                        className="h-full flex items-center justify-center transition-all"
                        style={{ width: `${pct}%`, backgroundColor: status.fill, minWidth: pct > 0 ? '24px' : 0 }}
                        title={`${status.name}: ${status.value}`}
                      >
                        <span className="text-[8px] font-black text-neo-black uppercase truncate px-1">
                          {pct > 10 ? status.name : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Status badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {appStatusData.map((status) => (
                  <div key={status.name} className="flex items-center gap-2 p-2 bg-neo-black/[0.03] dark:bg-white/[0.03] border border-neo-black/10 dark:border-white/10">
                    <div className="w-3 h-3 border border-neo-black/20" style={{ backgroundColor: status.fill }}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-wider text-neo-black dark:text-white truncate">{status.name}</div>
                      <div className="text-[11px] font-black text-neo-black dark:text-white">{status.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-3 border-t-2 border-dashed border-gray-100 dark:border-zinc-800 flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter text-gray-500">
                <TrendingUp className="w-3.5 h-3.5 text-neo-green" />
                <span>Acceptance Rate: {acceptanceRate}%</span>
              </div>
            </>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center">
              <AlertCircle className="w-10 h-10 text-gray-200 dark:text-zinc-700 mb-2" />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-gray-400">No Application Data</span>
            </div>
          )}
        </ChartSection>
      </div>

      {/* Row 4: Insights (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {/* Job Type Split */}
        <ChartSection title="Job Types" subtitle="Distribution by job type" icon={Briefcase} iconBg="bg-neo-yellow">
          {jobTypeData.length > 0 ? (
            <>
              <div className="h-[200px]">
                {hasMounted && (
                  <ResponsiveContainer width="100%" height={200} minWidth={0} debounce={10}>
                    <PieChart>
                      <Pie
                        data={jobTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={2}
                      >
                        {jobTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-1.5">
                {jobTypeData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      {item.name}
                    </span>
                    <span className="text-neo-black dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-200 dark:text-zinc-700 mb-2" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">No Job Data</span>
            </div>
          )}
        </ChartSection>

        {/* Work Mode Split */}
        <ChartSection title="Work Mode" subtitle="Remote / On-site / Hybrid" icon={Building2} iconBg="bg-neo-pink">
          {workTypeData.length > 0 ? (
            <>
              <div className="h-[200px]">
                {hasMounted && (
                  <ResponsiveContainer width="100%" height={200} minWidth={0} debounce={10}>
                    <PieChart>
                      <Pie
                        data={workTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={2}
                      >
                        {workTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#2ECC71', '#54A0FF', '#FFD026'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-1.5">
                {workTypeData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2" style={{ backgroundColor: ['#2ECC71', '#54A0FF', '#FFD026'][i % 3] }}></div>
                      {item.name}
                    </span>
                    <span className="text-neo-black dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-200 dark:text-zinc-700 mb-2" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">No Work Mode Data</span>
            </div>
          )}
        </ChartSection>

        {/* Platform Health Section */}
        <ChartSection title="Global Platform Health" subtitle="System performance & spotlight" icon={Activity} iconBg="bg-neo-green">
          <div className="space-y-4">
            {/* Top Company Spotlight */}
            <div className="bg-neo-black text-white p-4 border-2 border-neo-black shadow-[4px_4px_0px_0px_rgba(84,160,255,1)] relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform">
                <Building2 className="w-16 h-16 -mr-4 -mt-4 text-white" />
              </div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-neo-blue mb-1">Top Hiring Partner</div>
              <div className="text-xl font-black uppercase tracking-tight truncate pr-8">{stats?.topCompany || 'N/A'}</div>
              <div className="text-[7px] font-bold text-gray-400 mt-1 uppercase">Leading recruitment volume</div>
            </div>

            {/* AI Match Health */}
            <div className="space-y-1.5 p-3 bg-white dark:bg-zinc-800 border-2 border-neo-black shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Avg AI Match Score</span>
                <span className="text-xs font-black text-neo-black dark:text-white">{stats?.applications?.avgAiScore || 0}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-zinc-700 border border-neo-black/10">
                <div
                  className="h-full bg-neo-green"
                  style={{ width: `${stats?.applications?.avgAiScore || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Ratio Analytics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border-2 border-neo-black bg-neo-yellow/5 dark:bg-white/5 shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] font-black uppercase text-gray-400">Ecosystem Load</span>
                  <span className="text-[10px] font-black dark:text-white">
                    {stats?.user?.recruiters > 0 ? (stats.user.candidates / stats.user.recruiters).toFixed(1) : stats?.user?.candidates}:1
                  </span>
                </div>
                {/* Visual split bar */}
                <div className="h-1.5 flex border border-neo-black/10 overflow-hidden bg-gray-100 dark:bg-zinc-700">
                  <div
                    className="h-full bg-neo-blue"
                    style={{ width: `${(stats?.user?.candidates / (stats?.user?.candidates + stats?.user?.recruiters)) * 100 || 50}%` }}
                  ></div>
                  <div
                    className="h-full bg-neo-pink"
                    style={{ width: `${(stats?.user?.recruiters / (stats?.user?.candidates + stats?.user?.recruiters)) * 100 || 50}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-[6px] font-black uppercase text-gray-400 tracking-tighter">
                  <span>Talent</span>
                  <span>Recruiters</span>
                </div>
              </div>

              <div className="p-3 border-2 border-neo-black bg-neo-blue/5 dark:bg-white/5 shadow-[2px_2px_0px_0px_#000]">
                <div className="text-[8px] font-black uppercase text-gray-400 mb-1">Job Competition</div>
                <div className="text-sm font-black dark:text-white">{avgAppsPerJob}</div>
                <div className="text-[7px] font-bold text-gray-400 uppercase mt-0.5">Apps / Live Opening</div>
              </div>
            </div>

            {/* Automation Metrics */}
            <div className="flex items-center justify-between p-3 border-2 border-neo-black bg-neo-pink/5 dark:bg-white/5 shadow-[2px_2px_0px_0px_#000]">
              <div>
                <div className="text-[8px] font-black uppercase text-gray-400">Automation Rate</div>
                <div className="text-xs font-black dark:text-white mt-0.5">
                  {stats?.applications?.total > 0 ? Math.round((stats.applications.autoApplyCount / stats.applications.total) * 100) : 0}% OF ALL APPLIES
                </div>
              </div>
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </ChartSection>
      </div>

      {/* Row 5: Recent Registrations */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-4 border-b-2 border-neo-black dark:border-white flex items-center justify-between bg-neo-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-neo-black bg-neo-blue flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Users className="w-4 h-4 text-neo-black stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-neo-black dark:text-white leading-none">Recent Registrations</h3>
              <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Latest users who joined the platform</p>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 px-3 py-1 bg-neo-black dark:bg-white text-white dark:text-black border-2 border-neo-black dark:border-white font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <span>View All Users</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neo-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[9px]">
                <th className="p-3 pl-5">User</th>
                <th className="p-3">Type</th>
                <th className="p-3">Email</th>
                <th className="p-3 pr-5">Joined</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {(stats?.recentUsers || []).length > 0 ? (
                stats.recentUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-neo-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group border-b border-neo-black/5 dark:border-white/5">
                    <td className="p-3 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-neo-black overflow-hidden shadow-[2px_2px_0px_0px_#000] shrink-0">
                          <img
                            src={user.profilePicture || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.fullName}`}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-black text-neo-black dark:text-white uppercase truncate">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "px-1.5 py-0.5 border border-neo-black text-[8px] font-black uppercase leading-none",
                        user.userType === 'candidate' ? "bg-neo-blue text-white" : "bg-neo-yellow text-neo-black"
                      )}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-gray-500 truncate block max-w-[200px]">{user.email}</span>
                    </td>
                    <td className="p-3 pr-5">
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-gray-200 dark:text-zinc-700 mx-auto mb-2" />
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">No Recent Users</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
