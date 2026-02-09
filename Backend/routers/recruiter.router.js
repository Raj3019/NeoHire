const express = require("express")
const { profileRecruiter, editRecruiter, getApplicationsByJob, updateApplicationStatus, getJobApplicationStats, getAllJobsByRecruiter, uploadResume, uploadProfilePicture, getAllCandidates } = require("../controller/recruiter.controller")
const { authenticateSession } = require("../middleware/auth.middleware")
const recruiterRouter = express.Router()
const upload = require("../middleware/multer.middleware");
const { uploadLimiter } = require("../middleware/rateLimit.middleware");

//Profile
recruiterRouter.get("/profile", authenticateSession, profileRecruiter)

//Edit Profile
recruiterRouter.put("/profile/:id", authenticateSession, editRecruiter)

// Get All Candidate
recruiterRouter.get("/talents", authenticateSession, getAllCandidates)

recruiterRouter.post("/profile/resume", authenticateSession, uploadLimiter, upload.single('resume'), uploadResume)

recruiterRouter.post("/profile/picture", authenticateSession, uploadLimiter, upload.single('profilePicture'), uploadProfilePicture)

//Recuter Dashboard
// recuterRouter.get("/api/recuter/dashboard", authenticateSession, recuterDashboard)

// GET - ALL APPLICATIONS
recruiterRouter.get("/applications", authenticateSession, getAllJobsByRecruiter)

//GET Single Application
recruiterRouter.get("/applications/:applicationId/application", authenticateSession, getApplicationsByJob)


// POST - UPDATE APPLICATION STATS
recruiterRouter.put("/update/:applicationId/status", authenticateSession, updateApplicationStatus)

//GET - OVERALL APPLICATION STATS
recruiterRouter.get("/overall/:jobId/stats", authenticateSession, getJobApplicationStats)

module.exports = recruiterRouter