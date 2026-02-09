'use client';
import React, { useState, useEffect } from 'react';
import { talentRadarAPI } from '@/lib/api';
import AlertCard from './AlertCard';
import CreateAlertModal from './CreateAlertModal';
import MatchedCandidatesList from './MatchedCandidatesList';
import { NeoButton, NeoCard } from '@/components/ui/neo';
import { Plus, Search, Target, TrendingUp, AlertCircle, Zap, Radio, Crown } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function TalentRadarDashboard() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingMatches, setViewingMatches] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const alertLimit = user?.currentPlan?.features?.talentRadarAlerts || -1; // Default to unlimited for now
  const hasAccess = true; // FEATURE UNLOCKED: Plan check bypassed for testing/early access

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await talentRadarAPI.getAlerts();
      setAlerts(res.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingAlert) {
        await talentRadarAPI.updateAlert(editingAlert._id, data);
      } else {
        await talentRadarAPI.createAlert(data);
      }
      setShowCreateModal(false);
      setEditingAlert(null);
      loadAlerts();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Action failed';
      alert(errorMsg);
    }
  };

  const handleToggle = async (alertId) => {
    try {
      await talentRadarAPI.toggleAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const handleDelete = async (alertId) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      await talentRadarAPI.deleteAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleViewMatches = async (alert) => {
    try {
      setIsLoadingMatches(true);
      setViewingMatches(alert);
      const res = await talentRadarAPI.getMatches(alert._id);
      setMatches(res.matches || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  if (viewingMatches) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {isLoadingMatches ? (
          <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-200 dark:border-zinc-800">
            <div className="w-16 h-16 border-4 border-neo-blue border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-gray-500 uppercase font-black">Scanning database for "{viewingMatches.name}"...</p>
          </div>
        ) : (
          <MatchedCandidatesList
            matches={matches}
            alertName={viewingMatches.name}
            onClose={() => setViewingMatches(null)}
          />
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <NeoCard key={i} className="animate-pulse h-64 border-4" />
        ))}
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.isActive).length;
  const totalMatches = alerts.reduce((acc, a) => acc + (a.matchCount || 0), 0);

  if (!hasAccess) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <NeoCard className="py-16 text-center border-4 border-dashed border-neo-blue/30 bg-blue-50/10 dark:bg-blue-950/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <div className="w-14 h-14 bg-neo-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-neo-blue shadow-sm">
              <Radio className="w-7 h-7 text-neo-blue" />
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight dark:text-white mb-3">
              Talent <span className="text-neo-blue">Radar</span>
            </h2>

            <p className="text-gray-500 dark:text-gray-400 font-medium text-base leading-relaxed mb-8 max-w-lg mx-auto">
              Stop searching and start matching. Talent Radar scans our database 24/7 to find hidden gems that match your requirements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
              <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo-sm flex items-center gap-3">
                <Zap className="w-5 h-5 text-neo-orange" />
                <span className="font-bold text-sm uppercase">24/7 Auto-Scanning</span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo-sm flex items-center gap-3">
                <Target className="w-5 h-5 text-neo-green" />
                <span className="font-bold text-sm uppercase">Precision Filters</span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo-sm flex items-center gap-3">
                <Radio className="w-5 h-5 text-neo-blue" />
                <span className="font-bold text-sm uppercase">Priority Signals</span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo-sm flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-neo-pink" />
                <span className="font-bold text-sm uppercase">Global Reach</span>
              </div>
            </div>

            <Link href="/recruiter/profile">
              <NeoButton className="bg-neo-blue text-white px-10 py-4 text-base">
                Unlock Talent Radar Upgrade &rarr;
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeoCard className="bg-neo-blue text-white shadow-neo border-4 dark:border-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-mono text-sm opacity-80 uppercase font-bold tracking-widest">Active Radars</h3>
              <p className="text-5xl font-black mt-2">{activeAlerts}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </NeoCard>

        <NeoCard className="bg-neo-orange text-black shadow-neo border-4 dark:border-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-mono text-sm opacity-80 uppercase font-bold tracking-widest">Total Alerts</h3>
              <p className="text-5xl font-black mt-2">{alerts.length}</p>
            </div>
            <div className="p-3 bg-black/10 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </NeoCard>

        <NeoCard className="bg-neo-green text-white shadow-neo border-4 dark:border-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-mono text-sm opacity-80 uppercase font-bold tracking-widest">Matched Talents</h3>
              <p className="text-5xl font-black mt-2">{totalMatches}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </NeoCard>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border-4 border-black dark:border-white p-6 shadow-neo-sm">
        <div>
          <h2 className="text-2xl font-black uppercase dark:text-white">Active Alerts</h2>
          <p className="font-mono text-xs text-gray-500 font-bold mt-1 uppercase">Automated passive candidate discovery</p>
        </div>
        <NeoButton
          onClick={() => {
            setEditingAlert(null);
            setShowCreateModal(true);
          }}
          variant="black"
          className="px-8"
        >
          <Plus className="w-5 h-5 mr-2" /> Launch New Alert
        </NeoButton>
      </div>

      {alerts.length === 0 ? (
        <NeoCard className="py-20 text-center border-4 border-dashed border-gray-200 dark:border-zinc-800">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-2xl font-black uppercase dark:text-white mb-2 text-gray-400">No active radars</h3>
          <p className="text-gray-400 font-mono text-sm max-w-sm mx-auto mb-8 uppercase">
            Create an alert for specific skills and experience to find hidden talents on NeoHire.
          </p>
          <NeoButton
            onClick={() => setShowCreateModal(true)}
            variant="blue"
          >
            Set Up My First Radar
          </NeoButton>
        </NeoCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {alerts.map(alert => (
            <AlertCard
              key={alert._id}
              alert={alert}
              onEdit={(a) => {
                setEditingAlert(a);
                setShowCreateModal(true);
              }}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onViewMatches={handleViewMatches}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAlertModal
          alert={editingAlert}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAlert(null);
          }}
          onSave={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}
