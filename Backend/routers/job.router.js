const express = require("express")
const {authenticateSession, authenticateRole} = require("../middleware/auth.middleware")
const {createJob, listJobs, editJob, getJobById} = require("../controller/job.controller")
const checkRercuiterProfileComplete = require("../middleware/recruiter.middleware")
const { jobPostLimiter } = require("../middleware/rateLimit.middleware")
const jobRouter = express.Router()

//create Job

jobRouter.post('/create', authenticateSession, authenticateRole("Recruiter"), checkRercuiterProfileComplete, jobPostLimiter,createJob)

//edit job

jobRouter.put('/:id', authenticateSession, authenticateRole("Recruiter"), editJob)


//Get Jobs
jobRouter.get('/', authenticateSession, listJobs)

//Get Job [id]
jobRouter.get('/:id', authenticateSession, getJobById)

module.exports = jobRouter;