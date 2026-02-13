const express = require("express");
const {profileEmployee, editEmployee, getMyApplications, employeeDashboard, uploadProfilePicture, uploadResume,recommendJobToEmployee, getApplicationById} = require("../controller/employee.controller")
const {authenticateSession} = require("../middleware/auth.middleware")
const employeeRouter = express.Router();
require("dotenv").config();
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const upload = require("../middleware/multer.middleware");
const { uploadLimiter } = require("../middleware/rateLimit.middleware");
const { checkUserStatus } = require("../middleware/userStatus.middleware");

//GET - PROFILE
employeeRouter.get("/profile", authenticateSession,checkUserStatus, profileEmployee)
// PUT - PROFILE

employeeRouter.put("/profile/:id", authenticateSession, checkUserStatus,editEmployee)
//POST - RESUME UPLOAD
employeeRouter.post("/profile/resume", authenticateSession,checkUserStatus, uploadLimiter, upload.single('resume'), uploadResume)

employeeRouter.post("/profile/picture", authenticateSession, checkUserStatus, uploadLimiter, upload.single('profilePicture'), uploadProfilePicture)

// Dashboard
employeeRouter.get("/dashboard", authenticateSession, checkUserStatus, employeeDashboard)

// GET - ALL APPLICATIONS
employeeRouter.get("/applications", authenticateSession,checkUserStatus, getMyApplications)

// GET - APPLICATION BY ID
employeeRouter.get("/application/:jobId", authenticateSession,checkUserStatus, getApplicationById)

//GET - RECOMMENDED JOBS
employeeRouter.get("/recommendations", authenticateSession, checkUserStatus,recommendJobToEmployee)


module.exports = employeeRouter