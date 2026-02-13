'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { NeoButton } from '@/components/ui/neo';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarqueeStrip from './MarqueeStrip';

const BottomCTA = ({ isRecruiterMode }) => {
  const router = useRouter();

  return (
    <>
      {/* Pre-footer CTA section */}
      <section className="bg-neo-black dark:bg-zinc-900 border-t-8 border-neo-black dark:border-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase text-white leading-[0.9] mb-4">
              READY TO{' '}
              <span className={`inline-block px-3 transform -rotate-1 ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'}`}>
                {isRecruiterMode ? 'HIRE' : 'START'}
              </span>
              ?
            </h2>
            <p className="font-mono text-lg font-bold text-gray-400 mb-10 max-w-2xl mx-auto">
              {isRecruiterMode
                ? 'Join thousands of recruiters who closed their best hires through NeoHire. Set up in under 5 minutes.'
                : "Stop wasting time on applications that go nowhere. Let NeoHire's AI do the heavy lifting while you focus on landing your dream role."}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <NeoButton
                onClick={() => router.push(`/register${isRecruiterMode ? '?mode=recruiter' : ''}`)}
                className={`${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'} text-white text-xl py-5 px-10 border-4 border-white shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase`}
              >
                {isRecruiterMode ? 'Create Recruiter Account' : 'Create Free Account'}
              </NeoButton>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom marquee */}
      <MarqueeStrip
        text={
          isRecruiterMode
            ? '⚠ HIGH PERFORMANCE RECRUITING ⚠ AI POWERED RANKING ⚠'
            : '★ GET PAID WHAT YOU\'RE WORTH ★ BEAT THE SYSTEM ★'
        }
        reverse
        isRecruiterMode={isRecruiterMode}
        className={`border-b-0 border-t-8 text-white ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow !text-black'
          }`}
      />
    </>
  );
};

export default BottomCTA;
