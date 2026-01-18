const express = require("express")
const {registerRecruiter, loginRecruiter, profileRecruiter,logoutRecruiter, editRecruiter, getApplicationsByJob, updateApplicationStatus, getJobApplicationStats, getAllJobsByRecruiter, uploadResume, uploadProfilePicture, getAllCandidates, verifyEmail, resendVerificationEmail} = require("../controller/recruiter.controller")
const {authenticateJWT} = require("../middleware/auth.middleware")
const recruiterRouter = express.Router()
const upload = require("../middleware/multer.middleware");


// Register
recruiterRouter.post("/signup", registerRecruiter) 

// Email Verfication route
recruiterRouter.get('/verify-email/:token', verifyEmail)

// Resend Verfication route
recruiterRouter.post('/resend-verification', resendVerificationEmail)

//Login
recruiterRouter.post("/login", loginRecruiter)

//logout 
recruiterRouter.post("/logout",authenticateJWT, logoutRecruiter)


//Profile
recruiterRouter.get("/profile", authenticateJWT, profileRecruiter)

//Edit Profile
recruiterRouter.put("/profile/:id",authenticateJWT, editRecruiter)

// Get All Candidate
recruiterRouter.get("/talents", authenticateJWT, getAllCandidates)

recruiterRouter.post("/profile/resume", authenticateJWT, upload.single('resume'), uploadResume)

recruiterRouter.post("/profile/picture", authenticateJWT, upload.single('profilePicture'), uploadProfilePicture)

//Recuter Dashboard
// recuterRouter.get("/api/recuter/dashboard", authenticateJWT, recuterDashboard)

// GET - ALL APPLICATIONS
recruiterRouter.get("/applications", authenticateJWT, getAllJobsByRecruiter)

//GET Single Application
recruiterRouter.get("/applications/:applicationId/application", authenticateJWT, getApplicationsByJob)


// POST - UPDATE APPLICATION STATS
recruiterRouter.put("/update/:applicationId/status", authenticateJWT, updateApplicationStatus)

//GET - OVERALL APPLICATION STATS
recruiterRouter.get("/overall/:jobId/stats", authenticateJWT, getJobApplicationStats)

module.exports = recruiterRouter