const Job = require("../model/job.model");
const Application = require("../model/application.model");
const Employee = require("../model/employee.model");
const Recruiter = require("../model/recruiter.model");
const TalentAlert = require("../model/talentAlert.model");

// Read limits from env (required, no fallbacks - set -1 for unlimited)
const parseLimit = (value) => {
  if (value === undefined || value === null) {
    throw new Error('Limit environment variable is not set. Check your .env file.');
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid limit value: ${value}. Must be an integer or -1 for unlimited.`);
  }
  return parsed;
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
};

const LIMITS = {
  maxJobsPerRecruiter: parseLimit(process.env.MAX_JOBS_PER_RECRUITER),
  maxApplicationsPerEmployee: parseLimit(process.env.MAX_APPLICATIONS_PER_EMPLOYEE),
  maxResumeRoastsPerUser: parseLimit(process.env.MAX_RESUME_ROASTS_PER_USER),
  maxTalentRadarAlertsPerRecruiter: parseLimit(process.env.MAX_TALENT_RADAR_ALERTS_PER_RECRUITER),
};

/**
 * Middleware: Limit number of jobs a recruiter can create
 */
const checkJobCreationLimit = async (req, res, next) => {
  try {
    const limit = LIMITS.maxJobsPerRecruiter;
    if (limit === -1) return next(); // unlimited
    const { start, end } = getCurrentMonthRange();

    const recruiter = req.recruiterDoc;
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const jobCount = await Job.countDocuments({
      postedBy: recruiter._id,
      createdAt: { $gte: start, $lt: end },
    });

    if (jobCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `You've reached your monthly limit of ${limit} job posts.`,
        limitType: "JOB_CREATION",
        current: jobCount,
        limit,
      });
    }

    next();
  } catch (error) {
    console.error("Job creation limit check error:", error);
    return res.status(500).json({ message: "Failed to check usage limit", error: error.message });
  }
};

/**
 * Middleware: Limit number of job applications per employee
 */
const checkApplicationLimit = async (req, res, next) => {
  try {
    const limit = LIMITS.maxApplicationsPerEmployee;
    if (limit === -1) return next();
    const { start, end } = getCurrentMonthRange();

    const employeeId = req.user.id;
    const employee = await Employee.findOne({ betterAuthUserId: employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const applicationCount = await Application.countDocuments({
      JobSeeker: employee._id,
      createdAt: { $gte: start, $lt: end },
    });

    if (applicationCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `You've reached your monthly limit of ${limit} job applications.`,
        limitType: "JOB_APPLICATION",
        current: applicationCount,
        limit,
      });
    }

    next();
  } catch (error) {
    console.error("Application limit check error:", error);
    return res.status(500).json({ message: "Failed to check usage limit", error: error.message });
  }
};

/**
 * Middleware: Limit number of resume roasts per user (calendar month)
 * In-memory tracker is reset when the server restarts.
 */
const roastUsageTracker = new Map(); // Map<userId, { count, monthKey }>

const checkResumeRoastLimit = async (req, res, next) => {
  try {
    const limit = LIMITS.maxResumeRoastsPerUser;
    if (limit === -1) return next();

    // If user is authenticated, track by userId; otherwise track by IP
    const trackingKey = req.user?.id || req.ip;

    const monthKey = getCurrentMonthKey();
    const usage = roastUsageTracker.get(trackingKey);

    if (usage && usage.monthKey === monthKey) {
      if (usage.count >= limit) {
        return res.status(403).json({
          success: false,
          message: `You've reached your monthly limit of ${limit} resume roasts.`,
          limitType: "RESUME_ROAST",
          current: usage.count,
          limit,
        });
      }
    } else {
      // New calendar month or first use
      roastUsageTracker.set(trackingKey, { count: 0, monthKey });
    }

    // Increment after passing check (will be counted)
    const current = roastUsageTracker.get(trackingKey);
    current.count += 1;
    roastUsageTracker.set(trackingKey, current);

    next();
  } catch (error) {
    console.error("Resume roast limit check error:", error);
    return res.status(500).json({ message: "Failed to check usage limit", error: error.message });
  }
};

/**
 * Middleware: Limit number of talent radar alerts per recruiter
 */
const checkTalentRadarAlertLimit = async (req, res, next) => {
  try {
    const limit = LIMITS.maxTalentRadarAlertsPerRecruiter;
    if (limit === -1) return next();

    const recruiterId = req.user.id;
    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const alertCount = await TalentAlert.countDocuments({ recruiter: recruiter._id });

    if (alertCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `You've reached your limit of ${limit} talent radar alerts.`,
        limitType: "TALENT_RADAR_ALERT",
        current: alertCount,
        limit,
      });
    }

    next();
  } catch (error) {
    console.error("Talent radar limit check error:", error);
    return res.status(500).json({ message: "Failed to check usage limit", error: error.message });
  }
};

/**
 * Get usage stats for the current user (used by the /api/usage-limits endpoint)
 */
const getUserUsageLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { start, end } = getCurrentMonthRange();

    const usage = {};

    if (role === "Recruiter") {
      const recruiter = await Recruiter.findOne({ betterAuthUserId: userId });
      if (recruiter) {
        const jobCount = await Job.countDocuments({
          postedBy: recruiter._id,
          createdAt: { $gte: start, $lt: end },
        });
        const alertCount = await TalentAlert.countDocuments({ recruiter: recruiter._id });

        usage.jobCreation = {
          current: jobCount,
          limit: LIMITS.maxJobsPerRecruiter === -1 ? "Unlimited" : LIMITS.maxJobsPerRecruiter,
          remaining: LIMITS.maxJobsPerRecruiter === -1 ? "Unlimited" : Math.max(0, LIMITS.maxJobsPerRecruiter - jobCount),
        };
        usage.talentRadarAlerts = {
          current: alertCount,
          limit: LIMITS.maxTalentRadarAlertsPerRecruiter === -1 ? "Unlimited" : LIMITS.maxTalentRadarAlertsPerRecruiter,
          remaining: LIMITS.maxTalentRadarAlertsPerRecruiter === -1 ? "Unlimited" : Math.max(0, LIMITS.maxTalentRadarAlertsPerRecruiter - alertCount),
        };
      }
    }

    if (role === "Employee") {
      const employee = await Employee.findOne({ betterAuthUserId: userId });
      if (employee) {
        const applicationCount = await Application.countDocuments({
          JobSeeker: employee._id,
          createdAt: { $gte: start, $lt: end },
        });

        usage.jobApplications = {
          current: applicationCount,
          limit: LIMITS.maxApplicationsPerEmployee === -1 ? "Unlimited" : LIMITS.maxApplicationsPerEmployee,
          remaining: LIMITS.maxApplicationsPerEmployee === -1 ? "Unlimited" : Math.max(0, LIMITS.maxApplicationsPerEmployee - applicationCount),
        };
      }
    }

    // Resume roast (both roles)
    const trackingKey = userId || req.ip;
    const roastUsage = roastUsageTracker.get(trackingKey);
    const monthKey = getCurrentMonthKey();
    let roastCount = 0;

    if (roastUsage && roastUsage.monthKey === monthKey) {
      roastCount = roastUsage.count;
    }

    usage.resumeRoast = {
      current: roastCount,
      limit: LIMITS.maxResumeRoastsPerUser === -1 ? "Unlimited" : LIMITS.maxResumeRoastsPerUser,
      remaining: LIMITS.maxResumeRoastsPerUser === -1 ? "Unlimited" : Math.max(0, LIMITS.maxResumeRoastsPerUser - roastCount),
    };

    return res.status(200).json({
      success: true,
      data: usage,
      limits: {
        maxJobsPerRecruiter: LIMITS.maxJobsPerRecruiter === -1 ? "Unlimited" : LIMITS.maxJobsPerRecruiter,
        maxApplicationsPerEmployee: LIMITS.maxApplicationsPerEmployee === -1 ? "Unlimited" : LIMITS.maxApplicationsPerEmployee,
        maxResumeRoastsPerUser: LIMITS.maxResumeRoastsPerUser === -1 ? "Unlimited" : LIMITS.maxResumeRoastsPerUser,
        maxTalentRadarAlertsPerRecruiter: LIMITS.maxTalentRadarAlertsPerRecruiter === -1 ? "Unlimited" : LIMITS.maxTalentRadarAlertsPerRecruiter,
      },
    });
  } catch (error) {
    console.error("Get usage limits error:", error);
    return res.status(500).json({ message: "Failed to fetch usage limits", error: error.message });
  }
};

module.exports = {
  checkJobCreationLimit,
  checkApplicationLimit,
  checkResumeRoastLimit,
  checkTalentRadarAlertLimit,
  getUserUsageLimits,
  LIMITS,
};
