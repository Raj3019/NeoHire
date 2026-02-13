'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NeoButton } from '@/components/ui/neo';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

const PricingSection = ({ isRecruiterMode }) => {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  const candidateTiers = [
    {
      name: 'HUSTLE',
      price: 0,
      originalPrice: 10,
      yearlyPrice: 0,
      featured: false,
      cta: 'TRY IT',
      variant: 'secondary',
      features: [
        { text: '2 Daily job apply', included: true },
        { text: 'Basic Dashboard', included: true },
        { text: 'Auto-Apply', included: false },
      ],
    },
    {
      name: 'BALLER',
      price: 19,
      originalPrice: 25,
      yearlyPrice: 15,
      featured: true,
      label: 'BEST VALUE',
      cta: 'DOMINATE',
      accent: 'text-neo-yellow',
      features: [
        { text: '10 Daily job apply', included: true },
        { text: 'Auto-Apply Bot', included: true },
        { text: 'Resume Improvement', included: true },
        { text: 'Early access to new features', included: true },
        { text: 'Priority Support', included: true },
      ],
    },
    {
      name: 'GOD',
      price: 49,
      comingSoon: true,
      cta: 'GET HELP',
      features: [{ text: 'Coming Soon', included: true }],
    },
  ];

  const recruiterTiers = [
    {
      name: 'STARTUP',
      price: 0,
      originalPrice: 20,
      yearlyPrice: 0,
      featured: false,
      cta: 'TRY IT',
      variant: 'secondary',
      features: [
        { text: '5 Job posting monthly', included: true },
        { text: 'Basic AI Scoring', included: true },
        { text: 'Auto-Reject', included: false },
      ],
    },
    {
      name: 'SCALE',
      price: 69,
      originalPrice: 99,
      yearlyPrice: 55,
      featured: true,
      label: 'HIGH GROWTH',
      cta: 'SCALE UP',
      accent: 'text-neo-orange',
      features: [
        { text: '30 job posting monthly', included: true },
        { text: 'Recruiter Radar', included: true },
        { text: 'Early access to new features', included: true },
        { text: 'Priority Support', included: true },
      ],
    },
    {
      name: 'EMPIRE',
      price: 999,
      comingSoon: true,
      cta: 'CONTACT SALES',
      features: [{ text: 'Coming Soon', included: true }],
    },
  ];

  const tiers = isRecruiterMode ? recruiterTiers : candidateTiers;

  return (
    <section
      id="pricing"
      className="py-24 px-4 max-w-7xl mx-auto bg-grid-pattern bg-white dark:bg-[#121212] border-t-8 border-neo-black dark:border-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-6xl md:text-8xl font-black mb-10 text-center uppercase tracking-tighter dark:text-white">
          {isRecruiterMode ? 'PLANS' : 'PAY UP'}
        </h2>

        {/* Monthly / Yearly toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`font-black text-sm uppercase ${!isYearly ? 'dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-16 h-8 border-4 border-neo-black dark:border-white transition-colors ${
              isYearly ? (isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow') : 'bg-gray-200 dark:bg-zinc-700'
            }`}
            aria-label="Toggle yearly pricing"
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white border-2 border-neo-black transition-all ${
                isYearly ? 'left-8' : 'left-1'
              }`}
            />
          </button>
          <span className={`font-black text-sm uppercase ${isYearly ? 'dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="bg-neo-green text-black font-black text-xs px-2 py-1 border-2 border-neo-black uppercase">
              Save 20%
            </span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        {tiers.map((tier, i) => {
          const displayPrice = tier.comingSoon ? tier.price : isYearly ? tier.yearlyPrice : tier.price;

          if (tier.comingSoon) {
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-gray-100 dark:bg-zinc-800 border-4 border-gray-300 dark:border-gray-600 p-8 shadow-[4px_4px_0px_0px_#d1d5db] dark:shadow-[4px_4px_0px_0px_#4b5563] h-auto flex flex-col relative cursor-not-allowed diagonal-stripes">
                  <div className="absolute top-0 inset-x-0 -mt-4 flex justify-center">
                    <span className="bg-gray-500 text-white font-black uppercase px-4 py-1 border-2 border-gray-600 text-sm">
                      COMING SOON
                    </span>
                  </div>
                  <h3 className="text-4xl font-black uppercase mb-2 text-gray-500 dark:text-gray-400">{tier.name}</h3>
                  <p className="text-7xl font-black mb-6 text-gray-500 dark:text-gray-400">${tier.price}</p>
                  <ul className="font-mono text-sm space-y-4 mb-8 flex-1 font-bold text-gray-400 dark:text-gray-500">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="flex items-center">
                        <Check className="w-5 h-5 mr-3 text-gray-400" />
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  <button
                    disabled
                    className="w-full border-4 border-gray-400 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-4 text-xl font-black cursor-not-allowed"
                  >
                    {tier.cta}
                  </button>
                </div>
              </motion.div>
            );
          }

          if (tier.featured) {
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative z-10"
              >
                <div className={`bg-neo-black dark:bg-zinc-900 text-white border-4 border-neo-black dark:border-white p-8 shadow-neo-xl dark:shadow-[8px_8px_0px_0px_#ffffff] h-auto md:min-h-[36rem] flex flex-col relative transform md:scale-105 ${isRecruiterMode ? 'animate-pulse-border-recruiter' : 'animate-pulse-border'}`}>
                  <div className="absolute top-0 inset-x-0 -mt-6 flex justify-center">
                    <span className={`${isRecruiterMode ? 'bg-neo-orange text-black' : 'bg-white text-black'} font-black uppercase px-6 py-2 border-4 border-neo-black dark:border-white shadow-neo text-lg`}>
                      {tier.label}
                    </span>
                  </div>
                  <h3 className={`text-5xl font-black uppercase mb-4 mt-6 ${tier.accent}`}>{tier.name}</h3>
                  <div className="flex items-baseline gap-4 mb-8">
                    <p className="text-8xl font-black tracking-tighter">${displayPrice}</p>
                    {tier.originalPrice && (
                      <span className={`text-5xl font-black text-white/50 line-through decoration-4 ${isRecruiterMode ? 'decoration-neo-orange' : 'decoration-neo-yellow'} transform -rotate-2`}>
                        ${tier.originalPrice}
                      </span>
                    )}
                  </div>
                  {isYearly && (
                    <p className="font-mono text-xs font-bold text-white/60 -mt-6 mb-6 uppercase">/month billed yearly</p>
                  )}
                  <ul className="font-mono text-base space-y-5 mb-8 flex-1 font-bold">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="flex items-center">
                        {f.included ? (
                          <Check className="w-5 h-5 mr-3 text-neo-green flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 mr-3 text-neo-red flex-shrink-0" />
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  <NeoButton
                    className={`w-full ${isRecruiterMode ? 'bg-neo-orange border-4 border-white text-black hover:bg-orange-400 shadow-[6px_6px_0px_0px_#ffffff]' : 'bg-white border-4 border-black text-black hover:bg-gray-200 shadow-[6px_6px_0px_0px_#000000]'} py-6 text-xl`}
                  >
                    {tier.cta}
                  </NeoButton>
                </div>
              </motion.div>
            );
          }

          // Standard tier
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white p-8 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] h-auto flex flex-col relative group hover:-translate-y-2 transition-transform">
                <h3 className="text-4xl font-black uppercase mb-2 dark:text-white">{tier.name}</h3>
                <div className="flex items-baseline gap-3 mb-6">
                  <p className="text-7xl font-black dark:text-white tracking-tighter">${displayPrice}</p>
                  {tier.originalPrice && (
                    <span className="text-4xl font-black text-neo-black/40 dark:text-white/40 line-through decoration-4 decoration-neo-red transform -rotate-3">
                      ${tier.originalPrice}
                    </span>
                  )}
                </div>
                {isYearly && displayPrice > 0 && (
                  <p className="font-mono text-xs font-bold text-gray-400 -mt-4 mb-4 uppercase">/month billed yearly</p>
                )}
                <ul className="font-mono text-sm space-y-4 mb-8 flex-1 font-bold dark:text-gray-300">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className={`flex items-center ${!f.included ? 'text-gray-400 line-through decoration-2' : ''}`}>
                      {f.included ? (
                        <Check className="w-5 h-5 mr-3 text-neo-green flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>
                <NeoButton variant={tier.variant || 'secondary'} className="w-full border-4 shadow-neo-sm py-4 text-xl">
                  {tier.cta}
                </NeoButton>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
