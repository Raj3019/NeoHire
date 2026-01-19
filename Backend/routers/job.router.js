const express = require("express")
const {authenticateJWT, authenticateRole} = require("../middleware/auth.middleware")
const {createJob, listJobs, editJob, getJobById} = require("../controller/job.controller")
const checkRercuiterProfileComplete = require("../middleware/recruiter.middleware")
const jobRouter = express.Router()

//create Job

jobRouter.post('/create', authenticateJWT, authenticateRole("Recruiter"), createJob, checkRercuiterProfileComplete)

//edit job

jobRouter.put('/:id', authenticateJWT, authenticateRole("Recruiter"), editJob)


//Get Jobs
jobRouter.get('/', authenticateJWT, listJobs)

//Get Job [id]
jobRouter.get('/:id', authenticateJWT, getJobById)

module.exports = jobRouter;