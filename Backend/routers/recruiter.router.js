const express = require("express")
const { profileRecruiter, editRecruiter, getApplicationsByJob, updateApplicationStatus, getJobApplicationStats, getAllJobsByRecruiter, uploadResume, uploadProfilePicture, getAllCandidates } = require("../controller/recruiter.controller")
const { authenticateSession } = require("../middleware/auth.middleware")
const recruiterRouter = express.Router()
const upload = require("../middleware/multer.middleware");
const { uploadLimiter } = require("../middleware/rateLimit.middleware");
const { checkUserStatus } = require("../middleware/userStatus.middleware");

//Profile
recruiterRouter.get("/profile", authenticateSession, checkUserStatus, profileRecruiter)

//Edit Profile
recruiterRouter.put("/profile/:id", authenticateSession, checkUserStatus, editRecruiter)

// Get All Candidate
recruiterRouter.get("/talents", authenticateSession, checkUserStatus,getAllCandidates)

recruiterRouter.post("/profile/resume", authenticateSession,checkUserStatus, uploadLimiter, upload.single('resume'), uploadResume)

recruiterRouter.post("/profile/picture", authenticateSession, checkUserStatus,uploadLimiter, upload.single('profilePicture'), uploadProfilePicture)

//Recuter Dashboard
// recuterRouter.get("/api/recuter/dashboard", authenticateSession, recuterDashboard)

// GET - ALL APPLICATIONS
recruiterRouter.get("/applications", authenticateSession,checkUserStatus, getAllJobsByRecruiter)

//GET Single Application
recruiterRouter.get("/applications/:applicationId/application", authenticateSession,checkUserStatus, getApplicationsByJob)


// POST - UPDATE APPLICATION STATS
recruiterRouter.put("/update/:applicationId/status", authenticateSession,checkUserStatus, updateApplicationStatus)

//GET - OVERALL APPLICATION STATS
recruiterRouter.get("/overall/:jobId/stats", authenticateSession,checkUserStatus, getJobApplicationStats)

module.exports = recruiterRouter