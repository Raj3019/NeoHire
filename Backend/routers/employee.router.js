const express = require("express");
const {registerEmployee, loginEmployee, logoutEmployee, profileEmployee, editEmployee, getMyApplications, employeeDashboard, uploadProfilePicture, uploadResume,recommendJobToEmployee, getApplicationById, verifyEmail, resendVerificationEmail} = require("../controller/employee.controller")
const {authenticateJWT} = require("../middleware/auth.middleware")
const employeeRouter = express.Router();
require("dotenv").config();
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const upload = require("../middleware/multer.middleware");

//POST - SIGN-UP
employeeRouter.post("/signup", registerEmployee)


// Email Verfication route
employeeRouter.get('/verify-email/:token', verifyEmail)

// Resend Verfication route
employeeRouter.post('/resend-verification', resendVerificationEmail)

//POST - LOGIN
employeeRouter.post("/login", loginEmployee)

// POST - LOGOUT
employeeRouter.post("/logout", authenticateJWT, logoutEmployee)

//GET - PROFILE
employeeRouter.get("/profile", authenticateJWT, profileEmployee)
// PUT - PROFILE

employeeRouter.put("/profile/:id", authenticateJWT, editEmployee)
//POST - RESUME UPLOAD
employeeRouter.post("/profile/resume", authenticateJWT, upload.single('resume'), uploadResume)

employeeRouter.post("/profile/picture", authenticateJWT, upload.single('profilePicture'), uploadProfilePicture)

// Dashboard
employeeRouter.get("/dashboard", authenticateJWT, employeeDashboard)

// GET - ALL APPLICATIONS
employeeRouter.get("/applications", authenticateJWT, getMyApplications)

// GET - APPLICATION BY ID
employeeRouter.get("application/:jobId", authenticateJWT, getApplicationById)

//GET - RECOMMENDED JOBS
employeeRouter.get("/recommendations", authenticateJWT, recommendJobToEmployee)


module.exports = employeeRouter