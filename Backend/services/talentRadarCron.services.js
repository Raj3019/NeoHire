const cron = require("node-cron");
const {
  runTalentRadarScan,
} = require("../controller/talentRadar.controller");
const { logActivity } = require("../utils/activityLog.utils");

const initTalentRadarCron = (io, userSockets) => {
  // Production: Every 6 hours
  // const TALENT_RADAR_SCHEDULE = '0 */6 * * *';

  // For testing: Every 30 seconds
  const TALENT_RADAR_SCHEDULE = process.env.TALENT_RADAR_CRON_JOB;

  console.log("Talent Radar CRON job initialized");
  console.log(`Schedule: ${TALENT_RADAR_SCHEDULE}`);

  const talentRadarJob = cron.schedule(TALENT_RADAR_SCHEDULE, async () => {
    console.log("🔍 Talent Radar Cron Job Triggered");
    console.log(`Time: ${new Date().toLocaleString()}`);

    try {
      const results = await runTalentRadarScan(io, userSockets);

      console.log("TALENT RADAR RESULTS:");
      console.log(`Alerts processed: ${results.alertsProcessed}`);
      console.log(`Employees scanned: ${results.employeeScanned || 0}`);
      console.log(`New matches found: ${results.newMatches}`);

      logActivity({
        action: 'CRON_TALENT_RADAR',
        userRole: 'system',
        description: `Talent Radar scan: ${results.alertsProcessed} alerts processed, ${results.employeeScanned || 0} employees scanned, ${results.newMatches} new matches`,
        metadata: {
          alertsProcessed: results.alertsProcessed,
          employeesScanned: results.employeeScanned || 0,
          newMatches: results.newMatches
        }
      })

      if (results.details && results.details.length) {
        console.log("\n🎯 TALENT RADAR MATCHES:");
        results.details.forEach((alert) => {
          console.log(`   Alert: "${alert.alertName}"`);
          alert.newMatchesFound.forEach((match) =>
            console.log(`      └─ ${match.employeeName} (${match.fitScore}% fit)`)
          );
        });
      }
    } catch (error) {
      console.error("❌ Talent Radar CRON ERROR:", error.message);
      logActivity({
        action: 'CRON_TALENT_RADAR_ERROR',
        userRole: 'system',
        description: `Talent Radar cron failed: ${error.message}`,
        metadata: { error: error.message }
      })
    }
  });

  talentRadarJob.start();
  console.log("✅ Talent Radar CRON job started successfully!");

  return talentRadarJob;
};

module.exports = { initTalentRadarCron };