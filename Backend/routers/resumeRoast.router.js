const express = require("express")
const resumeRoast = require("../controller/resumeRoast.controller")
const upload = require("../middleware/multer.middleware")
const handleMulterError = require("../middleware/handleMulterError.middleware")
const { roastLimiter } = require("../middleware/rateLimit.middleware")
const roastResumeRouter = express.Router()

roastResumeRouter.post('/roast-my-resume', roastLimiter, upload.single('roastResume'), handleMulterError, resumeRoast)

module.exports = roastResumeRouter  