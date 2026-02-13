'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { NeoButton } from '@/components/ui/neo';
import { useRouter } from 'next/navigation';

const SocialProofCTA = ({ isRecruiterMode }) => {
  const router = useRouter();

  return (
    <section
      className={`${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'} border-y-8 border-neo-black dark:border-white py-20 px-4 overflow-hidden`}
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white drop-shadow-[6px_6px_0px_#000] leading-[0.9] mb-10">
            {isRecruiterMode ? "BUILD YOUR\nTEAM." : "SECURE THE\nBAG."}
          </h2>
          <NeoButton
            onClick={() => router.push(`/register${isRecruiterMode ? '?mode=recruiter' : ''}`)}
            className="bg-white text-neo-black text-2xl md:text-3xl py-6 md:py-8 px-10 md:px-16 shadow-neo-xl dark:shadow-[12px_12px_0px_0px_#000000] border-4 hover:scale-105 transform transition-transform uppercase"
          >
            {isRecruiterMode ? 'Start Hiring' : 'Get Hired'}
          </NeoButton>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofCTA;
