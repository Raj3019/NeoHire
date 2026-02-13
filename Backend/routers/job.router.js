const express = require("express")
const { authenticateSession, authenticateRole } = require("../middleware/auth.middleware")
const { createJob, listJobs, editJob, getJobById } = require("../controller/job.controller")
const checkRercuiterProfileComplete = require("../middleware/recruiter.middleware")
const { jobPostLimiter } = require("../middleware/rateLimit.middleware")
const { checkUserStatus } = require("../middleware/userStatus.middleware")
const jobRouter = express.Router()

//create Job

jobRouter.post('/create', authenticateSession, checkUserStatus, authenticateRole("Recruiter"), checkRercuiterProfileComplete, jobPostLimiter, createJob)

//edit job

jobRouter.put('/:id', authenticateSession, checkUserStatus, authenticateRole("Recruiter"), checkRercuiterProfileComplete, editJob)


//Get Jobs
jobRouter.get('/', authenticateSession, checkUserStatus, listJobs)

//Get Job [id]
jobRouter.get('/:id', authenticateSession, checkUserStatus, getJobById)

module.exports = jobRouter;