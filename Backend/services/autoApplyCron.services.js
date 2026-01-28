const cron = require("node-cron");
const {
  runAutoApplyForAllCandidates,
} = require("../controller/autoApply.controller");

const initAutoApplyCron = (io, userSocket) => {
  // const CRON_SCHEDULE = '0 */6 * * *'

  //For testing
  const CRON_SCHEDULE = "*/30 * * * * *";

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
    }
  });

  job.start()
  console.log("Auto-Apply CRON job started successfully!");
  return job;
};


module.exports = { initAutoApplyCron };
