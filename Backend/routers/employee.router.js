const express = require("express");
const {profileEmployee, editEmployee, getMyApplications, employeeDashboard, uploadProfilePicture, uploadResume,recommendJobToEmployee, getApplicationById} = require("../controller/employee.controller")
const {authenticateSession} = require("../middleware/auth.middleware")
const employeeRouter = express.Router();
require("dotenv").config();
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const upload = require("../middleware/multer.middleware");
const { uploadLimiter } = require("../middleware/rateLimit.middleware");

//GET - PROFILE
employeeRouter.get("/profile", authenticateSession, profileEmployee)
// PUT - PROFILE

employeeRouter.put("/profile/:id", authenticateSession, editEmployee)
//POST - RESUME UPLOAD
employeeRouter.post("/profile/resume", authenticateSession, uploadLimiter, upload.single('resume'), uploadResume)

employeeRouter.post("/profile/picture", authenticateSession, uploadLimiter, upload.single('profilePicture'), uploadProfilePicture)

// Dashboard
employeeRouter.get("/dashboard", authenticateSession, employeeDashboard)

// GET - ALL APPLICATIONS
employeeRouter.get("/applications", authenticateSession, getMyApplications)

// GET - APPLICATION BY ID
employeeRouter.get("/application/:jobId", authenticateSession, getApplicationById)

//GET - RECOMMENDED JOBS
employeeRouter.get("/recommendations", authenticateSession, recommendJobToEmployee)


module.exports = employeeRouter