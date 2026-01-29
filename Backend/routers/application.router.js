const express = require("express");
const applicationRouter = express.Router();
const {
  authenticateSession,
  authenticateRole,
} = require("../middleware/auth.middleware");
const {applyJob, checkScore} = require("../controller/application.controller");
const checkEmployeeProfileComplete = require("../middleware/employee.middleware")
const multer = require("multer");
const { applicationLimiter } = require("../middleware/rateLimit.middleware");
// const upload = require("../middleware/multer.middleware");
const upload = multer({ dest: 'resume/' , limits: { fileSize: 5 * 1024 * 1024 }})

applicationRouter.post(
  "/:id",
  authenticateSession,
  authenticateRole("Employee"),
  applicationLimiter,
  upload.single("resume"),
  checkEmployeeProfileComplete,
  applyJob,
);

applicationRouter.post(
  "/score/:id",
  authenticateSession,
  authenticateRole("Employee"),
  applicationLimiter,
  upload.single("resume"),
  checkScore
);

module.exports = applicationRouter