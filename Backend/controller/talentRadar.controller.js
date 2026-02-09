const TalentAlert = require('../model/talentAlert.model');
const Employee = require('../model/employee.model');
const Recruiter = require('../model/recruiter.model');
const { calculateSkillMatch, calculateExperienceMatch, calculateOverallMatch } = require('../utils/autoApply.utils');
const { createNotification, sendRealTimeNotification } = require('../utils/notification.utlis');

const createAlert = async (req, res) => {
  try {
    const recruiterId = req.user.id

    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId }).populate('currentPlan')

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    /* ========== TEST MODE: Plan check bypassed ==========
    // Check if recruiter has a plan and if Talent Radar is enabled
    if (!recruiter.currentPlan) {
      return res.status(403).json({
        message: 'Talent Radar is a premium feature. Please upgrade your plan to access it.',
        upgradeRequired: true
      });
    }

    const alertLimit = recruiter.currentPlan.features?.talentRadarAlerts || 0;

    if (alertLimit === 0) {
      return res.status(403).json({
        message: 'Talent Radar is not available in your current plan. Please upgrade to a paid tier.',
        upgradeRequired: true
      });
    }

    const existingAlertsCount = await TalentAlert.countDocuments({ recruiter: recruiter._id });

    if (alertLimit !== -1 && existingAlertsCount >= alertLimit) {
      return res.status(403).json({
        message: `You've reached your limit of ${alertLimit} alerts. Please upgrade for more.`,
        currentCount: existingAlertsCount,
        limit: alertLimit
      });
    }
    ========== END TEST MODE ========== */

    // TEST MODE: Allow unlimited alerts for testing
    const existingAlertsCount = await TalentAlert.countDocuments({ recruiter: recruiter._id });
    const alertLimit = -1; // Unlimited for testing

    // create alert
    const { name, requiredSkills, minExperience, minFitScore, location, workMode } = req.body;

    const newAlert = new TalentAlert({
      recruiter: recruiter._id,
      name,
      requiredSkills,
      minExperience: minExperience || 0,
      minFitScore: minFitScore || 80,
      location: location || null,
      workMode: workMode || null
    })

    await newAlert.save();

    return res.status(201).json({
      message: 'Talent alert created successfully',
      alert: newAlert,
      usage: {
        current: existingAlertsCount + 1,
        limit: alertLimit === -1 ? 'Unlimited' : alertLimit
      }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    return res.status(500).json({ message: 'Failed to create alert', error: error.message });
  }
}

//get alerts
const getMyAlerts = async (req, res) => {
  try {
    const recruiterId = req.user.id

    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId })
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    const alerts = await TalentAlert.find({ recruiter: recruiter._id })
      .sort({ createdAt: -1 })
      .lean();

    const alertsWithStats = alerts.map(alert => ({
      ...alert,
      matchCount: alert.matchedEmployee?.length || 0
    }))

    return res.status(200).json({
      alerts: alertsWithStats,
      total: alerts.length
    })
  } catch (error) {
    console.error('Get alerts error:', error);
    return res.status(500).json({ message: 'Failed to get alerts', error: error.message });
  }
}

const updateAlert = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { alertId } = req.params;
    const updates = req.body;

    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Find alert and verify ownership
    const alert = await TalentAlert.findOne({
      _id: alertId,
      recruiter: recruiter._id  // Security: only owner can update
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    const allowedUpdates = ['name', 'requiredSkills', 'minExperience', 'minFitScore', 'location', 'workMode'];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        alert[field] = updates[field]
      }
    })

    await alert.save()

    return res.status(200).json({
      message: 'Alert updated successfully',
      alert
    })
  } catch (error) {
    console.error('Update alert error:', error);
    return res.status(500).json({ message: 'Failed to update alert', error: error.message });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { alertId } = req.params;

    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const result = await TalentAlert.findOneAndDelete({
      _id: alertId,
      recruiter: recruiter._id  // Security: only owner can delete
    });

    if (!result) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    return res.status(200).json({ message: 'Alert deleted successfully' });

  } catch (error) {
    console.error('Delete alert error:', error);
    return res.status(500).json({ message: 'Failed to delete alert', error: error.message });
  }
};

const toggleAlert = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { alertId } = req.params;

    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const alert = await TalentAlert.findOne({
      _id: alertId,
      recruiter: recruiter._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    // Toggle the isActive status
    alert.isActive = !alert.isActive;
    await alert.save();

    return res.status(200).json({
      message: alert.isActive ? 'Alert activated' : 'Alert paused',
      isActive: alert.isActive
    });

  } catch (error) {
    console.error('Toggle alert error:', error);
    return res.status(500).json({ message: 'Failed to toggle alert', error: error.message });
  }
};

const getMatchedEmployees = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { alertId } = req.params;

    const recruiter = await Recruiter.findOne({ betterAuthUserId: recruiterId });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const alert = await TalentAlert.findOne({
      _id: alertId,
      recruiter: recruiter._id
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    // Return matched employees with all their info
    const matches = alert.matchedEmployee.map(match => ({
      employeeId: match.employee,
      name: match.employeeName,
      skills: match.employeeSkills,
      experience: match.employeeExperience,
      resumeUrl: match.resumeUrl,
      fitScore: match.fitScore,
      matchedAt: match.matchedAt
    }));

    // Sort by fit score (best matches first)
    matches.sort((a, b) => b.fitScore - a.fitScore);

    return res.status(200).json({
      alertName: alert.name,
      totalMatches: matches.length,
      matches
    });

  } catch (error) {
    console.error('Get matched candidates error:', error);
    return res.status(500).json({ message: 'Failed to get matches', error: error.message });
  }
};

const runTalentRadarScan = async (io, userSockets) => {
  try {
    const activeAlerts = await TalentAlert.find({ isActive: true }).populate('recruiter')
    console.log(`Found ${activeAlerts.length} active alerts`);

    if (activeAlerts.length === 0) {
      return { alertsProcess: 0, newMatches: 0 }
    }

    //get opted-in employee
    const optedInEmployee = await Employee.find({
      talentRadarOptIn: true,
      resumeFileURL: { $exists: true, $ne: '' },
      skills: { $exists: true, $not: { $size: 0 } },
      status: 'Active'
    })

    console.log(`Found ${optedInEmployee.length} opted-in candidates`);

    if (optedInEmployee.length === 0) {
      return { alertsProcessed: activeAlerts.length, newMatches: 0 };
    }

    const results = {
      alertsProcessed: activeAlerts.length,
      employeeScanned: optedInEmployee.length,
      newMatches: 0,
      details: []
    }

    for (const alert of activeAlerts) {
      const alertResults = {
        alertId: alert._id,
        alertName: alert.name,
        newMatchesFound: []
      }

      for (const employee of optedInEmployee) {
        const alreadyMatched = alert.matchedEmployee.some(
          match => match.employee.toString() === employee._id.toString()
        )
        if (alreadyMatched) continue

        const employeeExp = employee.experienceYears || 0;
        if (employeeExp < (alert.minExperience || 0)) continue;

        if (alert.location && employee.currentCity) {
          if (!employee.currentCity.toLowerCase().includes(alert.location.toLowerCase())) {
            continue;
          }
        }

        if (alert.workMode && employee.jobPreferences.workMode) {
          if (!employee.jobPreferences.workMode.includes(alert.workMode)) {
            continue;
          }
        }

        const skillMatch = calculateSkillMatch(employee.skills, alert.requiredSkills);
        const expMatch = calculateExperienceMatch(employeeExp, alert.minExperience || 0, (alert.minExperience || 0) + 10);
        const overallScore = calculateOverallMatch(skillMatch.percentage, expMatch);

        if (overallScore >= alert.minFitScore) {

          alert.matchedEmployee.push({
            employee: employee._id,
            matchedAt: new Date(),
            fitScore: overallScore,
            resumeUrl: employee.resumeFileURL,
            employeeName: employee.fullName,
            employeeSkills: employee.skills,
            employeeExperience: employeeExp
          });

          // Notify recruiter
          const notification = await createNotification({
            recipient: alert.recruiter._id,
            recipientModel: 'Recruiter',
            type: 'TALENT_MATCH',
            title: '🔍 Talent Radar Match!',
            message: `${employee.fullName} matches your "${alert.name}" alert (${overallScore}% fit)`,
            relatedJob: null
          });

          if (io && userSockets) {
            sendRealTimeNotification(io, userSockets, alert.recruiter._id, notification);
          }

          results.newMatches++;
          alertResults.newMatchesFound.push({
            employeeName: employee.fullName,
            fitScore: overallScore
          });
        }
      }

      await alert.save();

      if (alertResults.newMatchesFound.length > 0) {
        results.details.push(alertResults);
      }
    }

    console.log(`✅ Talent Radar complete. ${results.newMatches} new matches found`);
    return results;
  } catch (error) {
    console.error('❌ Talent Radar error:', error);
    throw error;
  }
}

const toggleTalentRadarOptIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { optIn } = req.body;

    const employee = await Employee.findOne({ betterAuthUserId: employeeId }).populate('currentPlan');

    if (!employee) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    /* ========== TEST MODE: Plan check bypassed ==========
    // Check plan for Talent Radar access (Premium only)
    const hasTalentRadarAccess = employee.currentPlan?.features?.talentRadarVisible || false;

    if (optIn && !hasTalentRadarAccess) {
      return res.status(403).json({
        message: 'Talent Radar discoverability is a premium feature. Please upgrade your plan to be seen by recruiters.',
        upgradeRequired: true
      });
    }
    ========== END TEST MODE ========== */

    // TEST MODE: Allow Talent Radar opt-in for all users
    const hasTalentRadarAccess = true;

    // Check if they have a resume (required for opt-in)
    if (optIn && !employee.resumeFileURL) {
      return res.status(400).json({
        message: 'Please upload your resume before enabling Talent Radar',
        missingFields: ['resume']
      });
    }

    employee.talentRadarOptIn = optIn;
    await employee.save();

    return res.status(200).json({
      message: optIn
        ? 'You are now discoverable by recruiters'
        : 'You are no longer discoverable by recruiters',
      talentRadarOptIn: employee.talentRadarOptIn
    });

  } catch (error) {
    console.error('Toggle opt-in error:', error);
    return res.status(500).json({ message: 'Failed to update setting', error: error.message });
  }
};


module.exports = {
  createAlert,
  getMyAlerts,
  updateAlert,
  deleteAlert,
  toggleAlert,
  getMatchedEmployees,
  runTalentRadarScan,
  toggleTalentRadarOptIn
};