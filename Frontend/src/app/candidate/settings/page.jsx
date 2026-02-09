'use client';
import React from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import ProfileCompletionBanner from '@/components/shared/ProfileCompletionBanner';
import AutoApplySettings from '@/components/candidate/AutoApplySettings';
import TalentRadarOptIn from '@/components/candidate/TalentRadarOptIn';
import { Settings, Shield, Zap, Radio } from 'lucide-react';

export default function CandidateSettingsPage() {
    return (
        <AuthGuard allowedRoles={['Employee']}>
            <ProfileCompletionBanner />
            <div className="min-h-screen bg-neo-bg dark:bg-zinc-950">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-neo-black dark:bg-white text-white dark:text-neo-black border-2 border-neo-black dark:border-white shadow-neo-sm">
                            <Settings className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase dark:text-white leading-none">Settings</h1>
                            <p className="font-mono text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest text-xs">Configure your automated career tools</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <h2 className="text-xl font-black uppercase dark:text-white">AI Automation</h2>
                            </div>
                            <AutoApplySettings />
                        </section>

                        <section className="pt-8 border-t-4 border-neo-black/10 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Radio className="w-5 h-5 text-neo-blue" />
                                <h2 className="text-xl font-black uppercase dark:text-white">Discoverability</h2>
                            </div>
                            <TalentRadarOptIn />
                        </section>

                        <section className="pt-8 border-t-4 border-neo-black/10 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-neo-green" />
                                <h2 className="text-xl font-black uppercase dark:text-white">Privacy & Policy</h2>
                            </div>
                            <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo-sm">
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    Your data security is our priority. Your profile is only shared with recruiters when matched by our AI or when you explicitly apply.
                                    You can disable visibility at any time above.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
