const express = require("express")
const resumeRoast = require("../controller/resumeRoast.controller")
const upload = require("../middleware/multer.middleware")
const handleMulterError = require("../middleware/handleMulterError.middleware")
const roastResumeRouter = express.Router()

roastResumeRouter.post('/roast-my-resume', upload.single('roastResume'), handleMulterError, resumeRoast)

module.exports = roastResumeRouter  