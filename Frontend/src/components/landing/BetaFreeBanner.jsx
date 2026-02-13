'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { NeoButton } from '@/components/ui/neo';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Gift, Rocket } from 'lucide-react';

const BetaFreeBanner = ({ isRecruiterMode }) => {
  const router = useRouter();

  const candidatePerks = [
    { icon: Zap, text: 'Unlimited Job Applications' },
    { icon: Sparkles, text: 'AI Resume Scoring' },
    { icon: Rocket, text: 'Auto-Apply Bot' },
    { icon: Gift, text: 'Resume Roast' },
  ];

  const recruiterPerks = [
    { icon: Zap, text: 'Unlimited Job Postings' },
    { icon: Sparkles, text: 'AI Candidate Scoring' },
    { icon: Rocket, text: 'Talent Radar Alerts' },
    { icon: Gift, text: 'Real-time Analytics' },
  ];

  const perks = isRecruiterMode ? recruiterPerks : candidatePerks;

  return (
    <section id="pricing" className="py-24 px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Main card */}
        <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo-xl dark:shadow-[12px_12px_0px_0px_#ffffff] overflow-hidden">
          {/* Top stripe */}
          <div className={`${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow'} py-3 px-6 border-b-4 border-neo-black dark:border-white flex items-center justify-center gap-3`}>
            <span className="animate-pulse text-xl">⚠</span>
            <span className="font-black uppercase text-sm md:text-base tracking-wider text-black">
              BETA ACCESS — EVERYTHING IS FREE
            </span>
            <span className="animate-pulse text-xl">⚠</span>
          </div>

          <div className="p-8 md:p-12 text-center">
            {/* Badge */}
            <div className="inline-block mb-6">
              <span className={`${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'} text-white font-black uppercase text-lg px-6 py-2 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff]`}>
                $0 / FOREVER*
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] mb-4 dark:text-white">
              WE'RE IN{' '}
              <span className={`inline-block px-3 transform -rotate-1 ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-yellow text-neo-black'}`}>
                BETA
              </span>
            </h2>
            <p className="font-mono text-base md:text-lg font-bold text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              {isRecruiterMode
                ? "We're building the future of recruiting. All premium features are unlocked and completely free while we're in beta. No credit card needed."
                : "We're building the ultimate career weapon. All premium features are unlocked and completely free while we're in beta. No credit card needed."}
            </p>

            {/* Perks grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
              {perks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <motion.div
                    key={perk.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="bg-neo-bg dark:bg-zinc-700 border-3 border-neo-black dark:border-white p-4 text-center hover:-translate-y-1 transition-transform group"
                    style={{ borderWidth: '3px' }}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 ${isRecruiterMode ? 'bg-neo-orange/20' : 'bg-neo-blue/20'} border-2 border-neo-black dark:border-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${isRecruiterMode ? 'text-neo-orange' : 'text-neo-blue'}`} strokeWidth={2.5} />
                    </div>
                    <p className="font-black text-xs uppercase dark:text-white leading-tight">
                      {perk.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Big price display */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-6xl md:text-8xl font-black dark:text-white">$0</span>
                <div className="text-left">
                  <p className="font-black text-xl text-gray-400 line-through decoration-4 decoration-neo-red transform -rotate-2">$19/mo</p>
                  <p className="font-mono text-xs font-bold text-gray-500 uppercase">during beta</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <NeoButton
              onClick={() => router.push(`/register${isRecruiterMode ? '?mode=recruiter' : ''}`)}
              className={`${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-black dark:bg-zinc-700'} text-white text-xl md:text-2xl py-5 px-12 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase`}
            >
              {isRecruiterMode ? 'Start Hiring — Free' : 'Get Started — Free'}
            </NeoButton>

            <p className="font-mono text-xs font-bold text-gray-400 dark:text-gray-500 mt-4 uppercase">
              * No credit card required. All features included. Pricing may change after beta.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default BetaFreeBanner;
