'use client';
import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import TalentRadarDashboard from '@/components/recruiter/TalentRadarDashboard';

export default function TalentRadarPage() {
  return (
    <AuthGuard allowedRoles={['Recruiter']}>
      <div className="min-h-screen bg-neo-bg dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-10 border-b-4 border-neo-black dark:border-white pb-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-2 dark:text-white">
              Talent <span className="text-neo-blue">Radar</span>
            </h1>
            <p className="font-mono text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-sm italic">
              Passive Candidate Matchmaking System
            </p>
          </div>

          <TalentRadarDashboard />
        </div>
      </div>
    </AuthGuard>
  );
}
