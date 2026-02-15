const { extractTextFromRoastPDF, resumeRoastText } = require("../utils/roast.utlis")
const { uploadRoastResumeToCloudnary } = require("../utils/cloudnary.utlis")
const fs = require('fs');
const { logActivity } = require('../utils/activityLog.utils');

const resumeRoast = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded"
      })
    }

    const resumeText = await extractTextFromRoastPDF(req.file.path, false)

    const cloudinaryResponse = await uploadRoastResumeToCloudnary(req.file.path)

    fs.unlinkSync(req.file.path)

    // Get roast result
    const roastResult = await resumeRoastText(resumeText)

    logActivity({
      action: 'RESUME_ROASTED',
      userId: req.user?.id || null,
      userRole: req.user?.role?.toLowerCase() || 'employee',
      resourceType: 'Resume',
      description: `User roasted their resume`,
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl
    })

    return res.status(201).json({
      success: true,
      data: {
        roast: roastResult,
        resumeUrl: cloudinaryResponse.url
      }
    })
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = resumeRoast