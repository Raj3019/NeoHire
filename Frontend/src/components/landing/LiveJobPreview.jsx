'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import { NeoBadge } from '@/components/ui/neo';
import { jobsAPI } from '@/lib/api';
import Link from 'next/link';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] p-6 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-zinc-700 w-3/4 mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-1/2 mb-4" />
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-gray-200 dark:bg-zinc-700 w-20 rounded-sm" />
      <div className="h-6 bg-gray-200 dark:bg-zinc-700 w-16 rounded-sm" />
    </div>
    <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-full mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-2/3" />
  </div>
);

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
};

const LiveJobPreview = ({ isRecruiterMode }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const res = await jobsAPI.getAll();
        const allJobs = res.data || res || [];
        // Take latest 4 active jobs
        const activeJobs = allJobs
          .filter((j) => j.status === 'active' || j.status === 'Active' || !j.status)
          .slice(0, 4);
        setJobs(activeJobs);
      } catch {
        setError(true);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className={`inline-block font-black uppercase text-xl px-6 py-3 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] mb-6 ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-green text-black'}`}>
          {isRecruiterMode ? '🔥 Open Roles' : '🔥 Fresh Drops'}
        </span>
        <h2 className="text-5xl md:text-7xl font-black uppercase leading-none dark:text-white">
          {isRecruiterMode ? 'ACTIVE POSTINGS' : 'LATEST JOBS'}
        </h2>
      </motion.div>

      {/* Jobs grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error || jobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff]">
          <p className="text-6xl mb-4">🏗️</p>
          <p className="font-black text-2xl uppercase dark:text-white mb-2">
            No Jobs Available Right Now
          </p>
          <p className="font-mono text-sm font-bold text-gray-500 dark:text-gray-400">
            Check back soon — new roles are posted daily.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={job._id || i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={cardVariants}
            >
              <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] p-6 hover:-translate-y-2 hover:shadow-neo-lg transition-all h-full flex flex-col group">
                {/* Job type badge */}
                <div className="mb-3">
                  <NeoBadge variant={job.type === 'Remote' ? 'green' : job.type === 'Hybrid' ? 'blue' : 'yellow'}>
                    {job.type || 'Full-time'}
                  </NeoBadge>
                </div>

                {/* Title */}
                <h3 className="font-black text-lg uppercase mb-1 dark:text-white leading-tight group-hover:text-neo-blue transition-colors">
                  {job.title}
                </h3>

                {/* Company */}
                <p className="font-mono text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">
                  {job.company || job.recruiterName || 'Company'}
                </p>

                {/* Meta */}
                <div className="space-y-2 mt-auto">
                  {(job.location || job.city) && (
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{job.location || job.city}</span>
                    </div>
                  )}
                  {(job.salary || job.salaryRange) && (
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-3 h-3" />
                      <span>{job.salary || job.salaryRange}</span>
                    </div>
                  )}
                  {job.createdAt && (
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(job.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View all CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12"
      >
        <Link
          href="/jobs"
          className={`inline-block font-black text-xl uppercase px-8 py-4 border-4 border-neo-black dark:border-white shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${
            isRecruiterMode
              ? 'bg-neo-orange text-white'
              : 'bg-neo-black dark:bg-zinc-800 text-white'
          }`}
        >
          View All Jobs →
        </Link>
      </motion.div>
    </section>
  );
};

export default LiveJobPreview;
