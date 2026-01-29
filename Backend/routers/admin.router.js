const express = require("express")
const adminRouter = express.Router()
const {isAdmin} = require("../middleware/adminAuth.middleware")
const {getDashboardStats, getAllUsers, updateUserStatus, getAllJobs, updateJobStatus, deleteJob} = require("../controller/admin.controller")
const { generalLimiter } = require("../middleware/rateLimit.middleware")

// All routes protected by isAdmin middleware
adminRouter.use(isAdmin)
adminRouter.use(generalLimiter)

// GET DASHBORD
adminRouter.get("/dashboard", getDashboardStats)

// GET ALL USERS
adminRouter.get("/users", getAllUsers)

// UPDATE USER STATUS
adminRouter.patch("/users/:id/status", updateUserStatus)

// GET ALL JOBS
adminRouter.get("/jobs", getAllJobs)

// UPDATE JOB STATUS
adminRouter.patch("/jobs/:id", updateJobStatus)

// DELETE JOB
adminRouter.delete("/jobs/:id", deleteJob)

module.exports = adminRouter