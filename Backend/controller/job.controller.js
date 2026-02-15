const Job = require("../model/job.model")
const Recruiter = require("../model/recruiter.model");
const Application = require("../model/application.model");
const Employee = require("../model/employee.model");
const { logActivity } = require("../utils/activityLog.utils");

const createJob = async (req, res) => {
  try {
    // Use the recruiter document attached by the checkRercuiterProfileComplete middleware
    const recruiter = req.recruiterDoc;

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const { title, description, jobRequirements, location, companyName, jobType, department, applicationDeadline, openings, status, industry, benefits, educationRequired, workType, skillsRequired, experienceLevel, salary, postedBy } = req.body

    const job = new Job(
      {
        title,
        description,
        jobRequirements,
        location,
        companyName,
        department,
        jobType,
        workType,
        applicationDeadline,
        openings,
        status,
        industry,
        benefits,
        educationRequired,
        skillsRequired,
        experienceLevel,
        salary,
        postedBy: recruiter._id  // Use MongoDB _id, not Better-Auth ID
      }
    )

    const createdJob = await job.save()

    // to save jobs in recuter model first it finds the recuter id from user 
    // then use $push to push in jobs table the newly created job id
    await Recruiter.findByIdAndUpdate(recruiter._id, { $push: { jobs: createdJob._id } })
    logActivity({
      action:'JOB_CREATED',
      userId: recruiter._id,
      userRole: 'recruiter',
      resourceType: 'Job',
      resourceId: createdJob._id,
      description: `Recruiter ${recruiter.fullName} created job: ${title} at ${companyName}`,      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })
    return res.status(200).json({ data: createdJob, message: "Job Created sucessfully" })

  } catch (err) {
    // console.log(err)
    return res.status(201).json({ message: "Unable to create Job", error: err.message })
  }
}

const listJobs = async (req, res) => {
  try {
    let jobs;

    if (req.user?.id && req.user.role === "Employee") {
      // Lookup employee by Better Auth ID
      const employee = await Employee.findOne({ betterAuthUserId: req.user.id });

      if (employee) {
        const appliedJobs = await Application.find({ JobSeeker: employee._id }).select('job')
        const appliedJobIds = appliedJobs.map(app => app.job)

        // fetch jobs excluding already applied ones
        jobs = await Job.find({
          _id: { $nin: appliedJobIds }, //exclude applied jobs
          status: "Active"
        }).sort({ createdAt: -1 })
      } else {
        jobs = await Job.find({ status: "Active" }).sort({ createdAt: -1 })
      }
    } else {
      jobs = await Job.find({ status: "Active" }).sort({ createdAt: -1 })
    }

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No Jobs avalible" })
    }
    return res.status(200).json({ data: jobs, message: "Fetched all the jobs" })
  } catch (err) {
    // console.log(err)
    return res.status(500).json({ message: "Unable to list Job", error: err.message })
  }
}


const editJob = async (req, res) => {
  try {
    const jobId = req.params.id

    const findJob = await Job.findById(jobId)

    if (findJob.postedBy.toString() !== req.recruiterDoc._id.toString()) {
      return res.status(401).json({ message: "This Job is not created by you" })
    }
    const updateJob = await Job.findByIdAndUpdate(jobId, req.body, { new: true })
    logActivity({
      action: 'JOB_EDITED',
      userId: req.recruiterDoc._id,
      userRole: 'recruiter',
      resourceType: 'Job',
      resourceId: updateJob._id,
      description: `Recruiter ${req.recruiterDoc.fullName} edited job: ${updateJob.title} at ${updateJob.companyName}`,
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })
    return res.status(200).json({ data: updateJob, message: "Job updated successfully" })
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: "Unable to update Job", error: error.message })
  }
}


const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id

    if (!jobId) {
      return res.status(401).json({ message: "No Job found" })
    }
    const getJobById = await Job.findById(jobId).populate('postedBy', 'fullName')

    return res.status(200).json({ data: getJobById, message: "Fetched the job" })
  } catch (err) {
    // console.log(err)
    return res.status(201).json({ message: "Unable to get Job", error: err.message })
  }
}

module.exports = {
  createJob,
  listJobs,
  editJob,
  getJobById
}