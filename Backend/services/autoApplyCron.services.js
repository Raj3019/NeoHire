const cron = require("node-cron");
const {
  runAutoApplyForAllCandidates,
} = require("../controller/autoApply.controller");
const { logActivity } = require("../utils/activityLog.utils");

const initAutoApplyCron = (io, userSocket) => {
  // const CRON_SCHEDULE = '0 */6 * * *'

  //For testing
  const CRON_SCHEDULE = process.env.AUTO_APPLY_CRON_JOB

  console.log("Auto Schedule cron job initized");
  console.log(`Schedule: ${CRON_SCHEDULE}`);

  const job = cron.schedule(CRON_SCHEDULE, async () => {
    // This function runs automatically at the scheduled times
    console.log("Cron Job Triggered");
    console.log(`Time: ${new Date().toLocaleString()}`);

    try {
      const results = await runAutoApplyForAllCandidates(io, userSocket);

      console.log("CRON JOB RESULTS:");
      console.log(`Candidates checked: ${results.totalCandidates}`);
      console.log(`Jobs checked: ${results.totalJobs}`);
      console.log(`Applications created: ${results.totalApplicationsCreated}`);

      logActivity({
        action: 'CRON_AUTO_APPLY',
        userRole: 'system',
        description: `Auto-apply cron: ${results.totalCandidates} candidates checked, ${results.totalJobs} jobs checked, ${results.totalApplicationsCreated} applications created`,
        metadata: {
          totalCandidates: results.totalCandidates,
          totalJobs: results.totalJobs,
          totalApplicationsCreated: results.totalApplicationsCreated
        }
      })

      // Log details of who got auto-applied
      if (!results.details.length) return;
      console.log("\n📋 AUTO-APPLIED DETAILS:");
      results.details.forEach((candidate, i) => {
        console.log(`   ${i + 1}. ${candidate.name}:`);
        candidate.applied.forEach((job) =>
          console.log(`      └─ ${job.title} (${job.matchScore}% match)`),
        );
      });
    } catch (error) {
      console.error("❌ CRON JOB ERROR:", error.message);
      logActivity({
        action: 'CRON_AUTO_APPLY_ERROR',
        userRole: 'system',
        description: `Auto-apply cron failed: ${error.message}`,
        metadata: { error: error.message }
      })
    }
  });

  job.start()
  console.log("Auto-Apply CRON job started successfully!");
  return job;
};


module.exports = { initAutoApplyCron };
