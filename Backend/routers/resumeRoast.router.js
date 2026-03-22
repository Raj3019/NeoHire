const express = require("express")
const resumeRoast = require("../controller/resumeRoast.controller")
const upload = require("../middleware/multer.middleware")
const handleMulterError = require("../middleware/handleMulterError.middleware")
const { checkResumeRoastLimit } = require("../middleware/usageLimit.middleware")
const { authenticateSession } = require("../middleware/auth.middleware")
const roastResumeRouter = express.Router()

roastResumeRouter.post('/roast-my-resume', authenticateSession, checkResumeRoastLimit, upload.single('roastResume'), handleMulterError, resumeRoast)

module.exports = roastResumeRouter  