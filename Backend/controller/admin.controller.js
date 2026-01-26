const Employee = require("../model/employee.model")
const Recruiter = require("../model/recruiter.model")
const Job = require("../model/job.model")
const Application = require("../model/application.model")

const getDashboardStats = async (req, res) => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const [
      totalRecruiters,
      totalCandidates,
      susendedRecruiter,
      suspendedCandidate,
      newRecruiterThisWeek,
      newCandidateThisWeek,
      totalJobs,
      activeJobs,
      closedJobs,
      jobsThisWeek,
      totalApplications,
      applicationsThisWeek,
      applicationsByStatus,
    ] = await Promise.all([
      Recruiter.countDocuments(),
      Employee.countDocuments(),
      Recruiter.countDocuments({ status: "Suspended" }),
      Employee.countDocuments({ status: "Suspended" }),
      Recruiter.countDocuments({ createdAt: { $gt: oneWeekAgo } }),
      Employee.countDocuments({ createdAt: { $gt: oneWeekAgo } }),
      Job.countDocuments(),
      Job.countDocuments({ status: "Active" }),
      Job.countDocuments({ status: "Closed" }),
      Job.countDocuments({ createdAt: { $gt: oneWeekAgo } }),
      Application.countDocuments(),
      Application.countDocuments({ createdAt: { $gt: oneWeekAgo } }),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ])

    const statusBreakDown = {};
    applicationsByStatus.forEach(item => {
      statusBreakDown[item._id.toLowerCase()] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          total: totalCandidates + totalRecruiters,
          candidates: totalCandidates,
          recruiters: totalRecruiters,
          newThisWeek: newCandidateThisWeek + newRecruiterThisWeek,
          suspended: suspendedCandidate + susendedRecruiter
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          postedThisWeek: jobsThisWeek
        },
        applications: {
          total: totalApplications,
          thisWeek: applicationsThisWeek,
          statusBreakDown
        }
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
      if (range === 'week') {
        date.setDate(date.getDate() - 7)
      } else if (range === 'month') {
        date.setMonth(date.getMonth() - 1)
      }
      filter.createdAt = { $gt: date }
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

    const fetchUser = async (Model, userType, skipCount, limitCount) => {
      // Different fields for different user types
      const selectFields = userType === 'candidate'
        ? 'fullName email profilePicture status country createdAt'
        : 'fullName email profilePicture status country createdAt currentEmployer'

      // Query the database
      const users = await Model.find(filter)
        .select(selectFields)
        .skip(skipCount)
        .limit(limitCount)
        .sort({ createdAt: -1 })

      return users.map(user => ({
        ...user.toObject(),  // Convert MongoDB document to plain object
        userType              // Add 'candidate' or 'recruiter' label
      }))
    }

    //Initialize variables to store results
    let allUsers = []
    let totalCount = 0

    //fetch data based on 'type' parameter

    // Case 1: Only want candidates
    if (type === 'candidate') {
      allUsers = await fetchUser(Employee, 'candidate', skip, parseInt(limit));
      totalCount = await Employee.countDocuments(filter)  // Count total candidates
    }

    // Case 2: Only want recruiters
    if (type === 'recruiter') {
      allUsers = await fetchUser(Recruiter, 'recruiter', skip, parseInt(limit))
      totalCount = await Recruiter.countDocuments(filter)
    }

    // Case 3: Want both (no type specified)
    if (!type) {
      const candidates = await fetchUser(Employee, 'candidate', 0, parseInt(limit))
      const recruiters = await fetchUser(Recruiter, 'recruiter', 0, parseInt(limit))

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
    const { status, page = 1, limit = 20, search } = req.query

    const skip = (page - 1) * limit

    let filter = {}
    if (status) filter.status = status

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
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