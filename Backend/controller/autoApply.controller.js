const Employee = require("../model/employee.model")
const Application = require("../model/application.model")
const Job = require("../model/job.model")
const { calculateSkillMatch, hasAlreadyApplied } = require("../utils/autoApply.utils")
const { createNotification, sendRealTimeNotification } = require('../utils/notification.utlis');
const { logActivity } = require('../utils/activityLog.utils');

const THRESHOLD = 80;

const runAutoApplyForAllCandidates = async (io, userSockets) => {
  // console.log("🤖 Auto-Apply CRON job started at:", new Date().toISOString());

  try {
    const eligibleEmployee = await Employee.find({
      autoApplyEnabled: true,
      status: "Active",
      resumeFileURL: { $exists: true, $ne: "" },
      skills: { $exists: true, $not: { $size: 0 } },
      phone: { $exists: true, $ne: "" },
      dateOfBirth: { $exists: true },
      currentCity: { $exists: true, $ne: "" },
      'education.tenth.schoolName': { $exists: true, $ne: "" },
      'jobPreferences.jobType': { $exists: true, $not: { $size: 0 } },
      'jobPreferences.workMode': { $exists: true, $not: { $size: 0 } },
      profilePicture: { $exists: true, $ne: "" }
    })

    // console.log(`📋 Found ${eligibleEmployee.length} eligible candidates`);

    const activeJobs = await Job.find({ status: "Active" })
    const results = {
      totalCandidates: eligibleEmployee.length,
      totalJobs: activeJobs.length,
      totalApplicationsCreated: 0,
      details: [] // Will hold per-candidate results
    }

    //For EACH candidate, check EACH job
    // This is a nested loop: O(candidates × jobs)
    // Example: 100 candidates × 50 jobs = 5000 checks per CRON run

    for (const employee of eligibleEmployee) {
      //Track this employee result
      const employeeResults = {
        employeeId: employee._id,
        name: employee.fullName,
        applied: []
      }

      for (const job of activeJobs) {
        // Skip if they've already applied (manually or auto)

        const alreadyApplied = await hasAlreadyApplied(
          employee._id,
          job._id
        )

        if (alreadyApplied) {
          // console.log(`  ⏭️ Skipping ${job.title}: Already applied`);
          continue
        }

        // STRICT EXPERIENCE CHECK: Candidate must meet minimum experience requirement
        const jobMinExperience = job.experienceRequired?.min || 0;
        const candidateExperience = employee.experienceYears || 0;

        // console.log(`  📋 Checking ${job.title}: Candidate exp=${candidateExperience}, Job min=${jobMinExperience}`);

        if (candidateExperience < jobMinExperience) {
          // console.log(`  ⏭️ Skipping ${job.title}: Not enough experience (${candidateExperience} < ${jobMinExperience})`);
          continue;
        }

        // Now check skills match (experience already validated above)
        const skillMatch = calculateSkillMatch(
          employee.skills,
          job.skillsRequired
        )

        // console.log(`  🎯 ${job.title}: Skills match = ${skillMatch.percentage}% (threshold: ${THRESHOLD}%)`);
        // console.log(`     Matched: ${skillMatch.matchedSkills.join(', ')}`);
        // console.log(`     Missing: ${skillMatch.missingSkills.join(', ')}`);

        // Only auto-apply if skills match meets threshold
        // Experience is already validated above as a hard requirement
        if (skillMatch.percentage >= THRESHOLD) {
          const application = new Application({
            job: job._id,
            JobSeeker: employee._id,
            postedBy: job.postedBy,
            resume: employee.resumeFileURL,
            appliedVia: "auto-apply",
            aiMatchScore: {
              overallScore: skillMatch.percentage,
              skillsMatch: skillMatch.percentage,
              experienceMatch: 100, // Candidate met experience requirement
              matchedSkills: skillMatch.matchedSkills,
              missingSkills: skillMatch.missingSkills,
              calculatedAt: new Date()
            }
          })

          await application.save()

          // Update employee appliedJob Array
          await Employee.findByIdAndUpdate(
            employee._id,
            { $push: { appliedJobs: application._id } }
          )

          //Update JOb appliedby array
          await Job.findByIdAndUpdate(
            job._id,
            {
              $push: {
                appliedBy: {
                  applicant: employee._id,
                  appliedAt: new Date(),
                  status: "Applied"
                }
              }
            }
          );

          // Notify the recruiter

          const recruiterNotification = await createNotification({
            recipient: job.postedBy,
            recipientModel: "Recruiter",
            type: "APPLICATION_RECEIVED",
            title: "New Auto-Applied Candidate",
            message: `${employee.fullName} auto-applied for: ${job.title} (${skillMatch.percentage}% match)`,
            relatedJob: job._id,
            relatedApplication: application._id
          })

          // REAL-TIME: Send notification to recruiter via Socket.io
          if (io && userSockets) {
            sendRealTimeNotification(io, userSockets, job.postedBy, recruiterNotification)
          }

          // Notify the candidate about the auto-apply
          const candidateNotification = await createNotification({
            recipient: employee._id,
            recipientModel: "Employee",
            type: "AUTO_APPLY_SUCCESS",
            title: "Auto-Applied Successfully! 🤖",
            message: `Smart Auto-Apply submitted your application to "${job.title}" at ${job.companyName || 'Company'} (${skillMatch.percentage}% match)`,
            relatedJob: job._id,
            relatedApplication: application._id
          })

          // REAL-TIME: Send notification to candidate via Socket.io
          if (io && userSockets) {
            sendRealTimeNotification(io, userSockets, employee._id, candidateNotification)
          }

          employeeResults.applied.push({
            jobId: job._id,
            title: job.title,
            matchScore: skillMatch.percentage
          })

          results.totalApplicationsCreated++;
        }
      }

      // Only add to details if candidate applied to something
      if (employeeResults.applied.length > 0) {
        results.details.push(employeeResults);
      }
    }
    // console.log(`✅ Auto-Apply completed. Created ${results.totalApplicationsCreated} applications`);
    return results;

  } catch (error) {
    // console.error("❌ Auto-Apply CRON error:", error);
    throw error;
  }
}

const toggleAutoApply = async (req, res) => {
  try {
    const employeeId = req.user.id
    const { enabled, threshold } = req.body

    const employee = await Employee.findOne({ betterAuthUserId: employeeId })

    if (!employee) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Requirements check for enabling
    if (enabled) {
      const requirements = {
        hasResume: !!employee.resumeFileURL,
        hasSkills: employee.skills && employee.skills.length > 0,
        hasPhone: !!employee.phone,
        hasDateOfBirth: !!employee.dateOfBirth,
        hasCurrentCity: !!employee.currentCity,
        hasEducation: !!employee.education?.tenth?.schoolName,
        hasJobType: employee.jobPreferences?.jobType?.length > 0,
        hasWorkMode: employee.jobPreferences?.workMode?.length > 0,
        hasProfilePicture: !!employee.profilePicture
      }

      const missing = Object.entries(requirements)
        .filter(([_, value]) => !value)
        .map(([key]) => key.replace('has', ''))

      if (missing.length > 0) {
        return res.status(400).json({
          message: "Please complete your profile before enabling auto-apply",
          missingFields: missing
        })
      }
    }

    employee.autoApplyEnabled = enabled
    await employee.save()

    logActivity({
      action: enabled ? 'AUTO_APPLY_ENABLED' : 'AUTO_APPLY_DISABLED',
      userId: employee._id,
      userRole: 'employee',
      resourceType: 'Employee',
      resourceId: employee._id,
      description: `${employee.fullName} ${enabled ? 'enabled' : 'disabled'} auto-apply`,
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })

    return res.status(200).json({
      message: enabled ? "Auto-apply is enabled" : "Auto-apply is disabled",
      autoApplyEnabled: employee.autoApplyEnabled, // Directly for frontend ease
      settings: {
        enabled: employee.autoApplyEnabled,
        threshold: THRESHOLD
      }
    })
  } catch (error) {
    console.error("Toggle auto-apply error:", error);
    return res.status(500).json({
      message: "Failed to update settings",
      error: error.message
    });
  }
}

const getAutoApplyStatus = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const employee = await Employee.findOne({ betterAuthUserId: employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    return res.status(200).json({
      enabled: employee.autoApplyEnabled || false,
      threshold: THRESHOLD,
      canEnable: {
        hasResume: !!employee.resumeFileURL,
        hasSkills: employee.skills && employee.skills.length > 0,
        hasPhone: !!employee.phone,
        hasDateOfBirth: !!employee.dateOfBirth,
        hasCity: !!employee.currentCity,
        hasEducation: !!employee.education?.tenth?.schoolName,
        hasJobPreferences: employee.jobPreferences?.jobType?.length > 0 && employee.jobPreferences?.workMode?.length > 0,
        hasProfilePicture: !!employee.profilePicture
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get status" });
  }
};

const runAutoApplyNow = async (req, res) => {
  try {
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');

    const results = await runAutoApplyForAllCandidates(io, userSockets);

    logActivity({
      action: 'AUTO_APPLY_MANUAL_RUN',
      userId: req.user?.id || null,
      userRole: 'admin',
      resourceType: 'System',
      description: `Admin manually triggered auto-apply: ${results.totalApplicationsCreated} applications created`,
      metadata: { totalCandidates: results.totalCandidates, totalJobs: results.totalJobs, totalApplicationsCreated: results.totalApplicationsCreated },
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })

    return res.status(200).json({
      message: "Auto-apply completed",
      results
    });
  } catch (error) {
    return res.status(500).json({
      message: "Auto-apply failed",
      error: error.message
    });
  }
};

const getAutoApplyHistory = async (req, res) => {
  try {
    const employeeId = req.user.id

    const employee = await Employee.findOne({ betterAuthUserId: employeeId })

    if (!employee) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const autoAppliedJobs = await Application.find({
      JobSeeker: employee._id,
      appliedVia: "auto-apply"
    }).populate('job', 'title companyName location') // Get job details
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    const applications = autoAppliedJobs.map(app => ({
      applicationId: app._id,
      jobId: app.job?._id,
      jobTitle: app.job?.title || "Unknown",
      company: app.job?.companyName || "Unknown",
      location: app.job?.location || "Unknown",
      matchScore: app.aiMatchScore?.overallScore || 0,
      status: app.status,
      appliedAt: app.createdAt
    }));

    return res.status(200).json({
      totalAutoApplied: applications.length,
      applications
    });
  } catch (error) {
    console.error("Get auto-apply history error:", error);
    return res.status(500).json({
      message: "Failed to get auto-apply history",
      error: error.message
    });
  }
}

module.exports = {
  runAutoApplyForAllCandidates,
  toggleAutoApply,
  getAutoApplyStatus,
  runAutoApplyNow,
  getAutoApplyHistory
}