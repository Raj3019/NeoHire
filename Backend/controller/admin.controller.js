const Employee = require("../model/employee.model")
const Recruiter = require("../model/recruiter.model")
const Job = require("../model/job.model")
const Application = require("../model/application.model")
const TalentAlert = require("../model/talentAlert.model")
const { MongoClient } = require("mongodb")
const { sendStatusChangeEmail } = require("../utils/emailService.utlis")
const { logActivity } = require('../utils/activityLog.utils')

// Connect to MongoDB to access Better Auth user collection
const client = new MongoClient(process.env.MONGODB_URL)
let authUserCollection = null

const getAuthUserCollection = async () => {
  if (!authUserCollection) {
    await client.connect()
    authUserCollection = client.db().collection('user')
  }
  return authUserCollection
}

const getDashboardStats = async (req, res) => {
  try {
    // Time range filter: 7, 15, or 30 days (default 7)
    const rangeDays = parseInt(req.query.range) || 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - rangeDays)
    startDate.setHours(0, 0, 0, 0)

    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const [
      totalRecruiters,
      totalCandidates,
      suspendedRecruiter,
      suspendedCandidate,
      newRecruitersInRange,
      newCandidatesInRange,
      totalJobs,
      activeJobs,
      closedJobs,
      jobsInRange,
      totalApplications,
      applicationsInRange,
      applicationsByStatus,
      // New queries
      jobsByType,
      jobsByWorkType,
      autoApplyCount,
      avgAiScoreResult,
      topCompanyResult,
      closingSoonCount,
      candidateTrend,
      recruiterTrend,
      applicationTrend,
      recentCandidates,
      recentRecruiters,
      talentRadarCount,
      talentAlertCount,
      talentAlertsInRange,
    ] = await Promise.all([
      Recruiter.countDocuments(),
      Employee.countDocuments(),
      Recruiter.countDocuments({ status: "Suspended" }),
      Employee.countDocuments({ status: "Suspended" }),
      Recruiter.countDocuments({ createdAt: { $gte: startDate } }),
      Employee.countDocuments({ createdAt: { $gte: startDate } }),
      Job.countDocuments(),
      Job.countDocuments({ status: "Active" }),
      Job.countDocuments({ status: "Closed" }),
      Job.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments(),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      // Job type distribution
      Job.aggregate([{ $group: { _id: "$jobType", count: { $sum: 1 } } }]),
      // Work type distribution
      Job.aggregate([{ $group: { _id: "$workType", count: { $sum: 1 } } }]),
      // Auto-apply count
      Application.countDocuments({ appliedVia: 'auto-apply' }),
      // Average AI match score
      Application.aggregate([
        { $match: { 'aiMatchScore.overallScore': { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$aiMatchScore.overallScore' } } }
      ]),
      // Top company by job count
      Job.aggregate([
        { $group: { _id: "$companyName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      // Jobs closing within next 7 days
      Job.countDocuments({
        status: 'Active',
        applicationDeadline: { $lte: nextWeek, $gte: new Date() }
      }),
      // Day-by-day candidate registration trend
      Employee.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Day-by-day recruiter registration trend
      Recruiter.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      // Day-by-day application trend split by appliedVia
      Application.aggregate([
        { $match: { appliedAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" } },
              via: "$appliedVia"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]),
      // Recent 5 candidates
      Employee.find().select('fullName email profilePicture createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      // Recent 5 recruiters
      Recruiter.find().select('fullName email profilePicture createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      // Talent Radar count
      Employee.countDocuments({ talentRadarOptIn: true }),
      // Talent Alert count
      TalentAlert.countDocuments(),
      // Talent Alerts created in range
      TalentAlert.countDocuments({ createdAt: { $gte: startDate } })
    ])

    // Process status breakdown
    const statusBreakDown = {};
    applicationsByStatus.forEach(item => {
      statusBreakDown[item._id.toLowerCase()] = item.count;
    });

    // Process job type distribution
    const byJobType = {};
    jobsByType.forEach(item => { if (item._id) byJobType[item._id] = item.count; });

    // Process work type distribution
    const byWorkType = {};
    jobsByWorkType.forEach(item => { if (item._id) byWorkType[item._id] = item.count; });

    // Build day-by-day registration trend (fill gaps with 0)
    const registrationTrend = []
    const candidateMap = {}
    candidateTrend.forEach(d => { candidateMap[d._id] = d.count; })
    const recruiterMap = {}
    recruiterTrend.forEach(d => { recruiterMap[d._id] = d.count; })

    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      registrationTrend.push({
        date: key,
        candidates: candidateMap[key] || 0,
        recruiters: recruiterMap[key] || 0
      })
    }

    // Build day-by-day application trend
    const appTrendMap = {}
    applicationTrend.forEach(d => {
      const date = d._id.date
      if (!appTrendMap[date]) appTrendMap[date] = { manual: 0, autoApply: 0 }
      if (d._id.via === 'auto-apply') {
        appTrendMap[date].autoApply = d.count
      } else {
        appTrendMap[date].manual = d.count
      }
    })

    const applicationTrendData = []
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      applicationTrendData.push({
        date: key,
        manual: appTrendMap[key]?.manual || 0,
        autoApply: appTrendMap[key]?.autoApply || 0
      })
    }

    // Merge recent users (candidates + recruiters), sort by newest, take 5
    const recentUsers = [
      ...recentCandidates.map(u => ({ ...u, userType: 'candidate' })),
      ...recentRecruiters.map(u => ({ ...u, userType: 'recruiter' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

    res.status(200).json({
      success: true,
      data: {
        user: {
          total: totalCandidates + totalRecruiters,
          candidates: totalCandidates,
          recruiters: totalRecruiters,
          newInRange: newCandidatesInRange + newRecruitersInRange,
          suspended: suspendedCandidate + suspendedRecruiter
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          postedInRange: jobsInRange,
          byJobType,
          byWorkType,
          closingSoon: closingSoonCount
        },
        applications: {
          total: totalApplications,
          inRange: applicationsInRange,
          statusBreakDown,
          autoApplyCount,
          avgAiScore: avgAiScoreResult[0]?.avg ? Math.round(avgAiScoreResult[0].avg) : 0
        },
        trends: {
          registrations: registrationTrend,
          applications: applicationTrendData
        },
        topCompany: topCompanyResult[0]?._id || 'N/A',
        talentRadar: {
          candidateOptIns: talentRadarCount,
          recruiterAlerts: talentAlertCount,
          newAlertsInRange: talentAlertsInRange
        },
        recentUsers
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

const getAllUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20
    const type = req.query.type
    const search = req.query.search
    const status = req.query.status
    const range = req.query.range

    const skip = (page - 1) * limit

    let filter = {}

    // If range is provided, calculate the date
    if (range) {
      const date = new Date()
      if (range === 'week' || range === '7') {
        date.setDate(date.getDate() - 7)
      } else if (range === '15') {
        date.setDate(date.getDate() - 15)
      } else if (range === 'month' || range === '30') {
        date.setDate(date.getDate() - 30)
      }
      filter.createdAt = { $gte: date }
    }

    // If status is provided, only get users with that status
    if (status) {
      filter.status = status;
    }

    // If search text is provided, search in name OR email
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    // Get the auth user collection to look up roles
    const userCollection = await getAuthUserCollection()

    // Helper to get user role from auth collection
    const getUserRole = async (betterAuthUserId, email) => {
      // Try finding by 'id' field first (Better Auth standard)
      let authUser = await userCollection.findOne({ id: betterAuthUserId })

      // If not found, try by email as fallback
      if (!authUser && email) {
        authUser = await userCollection.findOne({ email: email.toLowerCase() })
      }

      console.log(`[getUserRole] betterAuthUserId: ${betterAuthUserId}, email: ${email}, found: ${!!authUser}, role: ${authUser?.role}`)
      return authUser?.role || null
    }

    // Helper to enrich users with their actual role from auth collection
    const enrichUsersWithAuthRole = async (users, defaultUserType) => {
      const enrichedUsers = await Promise.all(users.map(async (user) => {
        const userObj = user.toObject ? user.toObject() : user
        const authRole = await getUserRole(userObj.betterAuthUserId, userObj.email)

        // Determine userType based on auth role
        let userType = defaultUserType
        if (authRole === 'Admin') {
          userType = 'admin'
        } else if (authRole === 'Recruiter') {
          userType = 'recruiter'
        } else if (authRole === 'Employee') {
          userType = 'candidate'
        }

        return {
          ...userObj,
          userType
        }
      }))
      return enrichedUsers
    }

    const fetchCandidates = async (skipCount, limitCount) => {
      const selectFields = 'fullName email profilePicture status country createdAt betterAuthUserId'
      const users = await Employee.find(filter)
        .select(selectFields)
        .skip(skipCount)
        .limit(limitCount)
        .sort({ createdAt: -1 })
      return enrichUsersWithAuthRole(users, 'candidate')
    }

    const fetchRecruiters = async (skipCount, limitCount, excludeAdmins = false, onlyAdmins = false) => {
      const selectFields = 'fullName email profilePicture status country createdAt currentEmployer betterAuthUserId'
      const users = await Recruiter.find(filter)
        .select(selectFields)
        .skip(skipCount)
        .limit(limitCount)
        .sort({ createdAt: -1 })

      // Enrich with auth roles
      const enrichedUsers = await enrichUsersWithAuthRole(users, 'recruiter')

      // Filter based on flags
      if (excludeAdmins) {
        return enrichedUsers.filter(u => u.userType !== 'admin')
      }
      if (onlyAdmins) {
        return enrichedUsers.filter(u => u.userType === 'admin')
      }
      return enrichedUsers
    }

    //Initialize variables to store results
    let allUsers = []
    let totalCount = 0

    //fetch data based on 'type' parameter

    // Case 1: Only want candidates
    if (type === 'candidate') {
      allUsers = await fetchCandidates(skip, parseInt(limit));
      totalCount = await Employee.countDocuments(filter)
    }

    // Case 2: Only want recruiters (exclude admins)
    else if (type === 'recruiter') {
      // Fetch more than needed since we'll filter out admins
      const recruiters = await fetchRecruiters(0, parseInt(limit) * 2, true, false)
      allUsers = recruiters.slice(skip, skip + parseInt(limit))
      // For total count, we need to count actual non-admin recruiters
      const allRecruiters = await Recruiter.find(filter).select('betterAuthUserId')
      const enrichedAll = await enrichUsersWithAuthRole(allRecruiters, 'recruiter')
      totalCount = enrichedAll.filter(u => u.userType !== 'admin').length
    }

    // Case 3: Only want admins
    else if (type === 'admin') {
      // Fetch recruiters and filter to admins only
      const admins = await fetchRecruiters(0, parseInt(limit) * 2, false, true)
      allUsers = admins.slice(skip, skip + parseInt(limit))
      // For total count, count only admins
      const allRecruiters = await Recruiter.find(filter).select('betterAuthUserId')
      const enrichedAll = await enrichUsersWithAuthRole(allRecruiters, 'recruiter')
      totalCount = enrichedAll.filter(u => u.userType === 'admin').length
    }

    // Case 4: Want all (no type specified)
    else {
      const candidates = await fetchCandidates(0, parseInt(limit))
      const recruiters = await fetchRecruiters(0, parseInt(limit))

      // combine both into array
      allUsers = [...candidates, ...recruiters]

      // Count total from both tables
      const candidateCount = await Employee.countDocuments(filter)
      const recruiterCount = await Recruiter.countDocuments(filter)

      totalCount = candidateCount + recruiterCount
    }

    //Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: allUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: totalPages
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// UPDATE USER STATUS
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userType, status } = req.body

    if (!['Active', 'Suspended', 'Banned'].includes(status)) {
      return res.status(400).json({ sucess: true, message: 'Invalid Status' })
    }

    const Model = userType === 'recruiter' ? Recruiter : Employee;
    const user = await Model.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('fullName email status')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    await sendStatusChangeEmail(user.email, user.fullName, status)

    logActivity({
      action: 'USER_STATUS_CHANGED',
      userId: req.user?.id || null,
      userRole: 'admin',
      resourceType: userType === 'recruiter' ? 'Recruiter' : 'Employee',
      resourceId: id,
      description: `Admin changed ${user.fullName} (${user.email}) status to ${status}`,
      metadata: { targetUserType: userType, newStatus: status, targetEmail: user.email },
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })

    res.status(200).json({
      success: true,
      message: `User ${status === 'Active' ? 'activated' : status}`,
      data: user
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//GET ALL JOBS
const getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search, range } = req.query

    const skip = (page - 1) * limit

    let filter = {}
    if (status) filter.status = status

    if (range) {
      const date = new Date()
      if (range === '7') date.setDate(date.getDate() - 7)
      else if (range === '15') date.setDate(date.getDate() - 15)
      else if (range === '30') date.setDate(date.getDate() - 30)
      filter.createdAt = { $gte: date }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ]
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'fullName email')
        .select('title companyName location status createdAt appliedBy')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Job.countDocuments(filter)
    ])

    const jobsWithCount = jobs.map(job => ({
      ...job.toObject(),
      applicationCount: job.appliedBy?.length || 0
    }))

    res.status(200).json({
      success: true,
      data: jobsWithCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//UPDATE JOB STATUS 
const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const job = await Job.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("title companyName status")

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    logActivity({
      action: 'JOB_STATUS_CHANGED',
      userId: req.user?.id || null,
      userRole: 'admin',
      resourceType: 'Job',
      resourceId: id,
      description: `Admin changed job "${job.title}" at ${job.companyName} status to ${status}`,
      metadata: { newStatus: status, jobTitle: job.title, companyName: job.companyName },
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })

    res.status(200).json({
      success: true,
      data: job
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


// DELETE JOB
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params
    const job = await Job.findByIdAndDelete(id)

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    // Also delete related applications
    await Application.deleteMany({ job: id })

    logActivity({
      action: 'JOB_DELETED',
      userId: req.user?.id || null,
      userRole: 'admin',
      resourceType: 'Job',
      resourceId: id,
      description: `Admin deleted job "${job.title}" at ${job.companyName || 'Unknown'}`,
      metadata: { jobTitle: job.title, companyName: job.companyName },
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })

    res.status(200).json({
      success: true,
      message: "Job deleted Successfully"
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllJobs,
  updateJobStatus,
  deleteJob
}