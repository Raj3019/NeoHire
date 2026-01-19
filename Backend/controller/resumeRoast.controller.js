const { extractTextFromRoastPDF, resumeRoastText } = require("../utils/roast.utlis")
const { uploadRoastResumeToCloudnary } = require("../utils/cloudnary.utlis")

const resumeRoast = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded"
      })
    }

    const localFilePath = req.file.path

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadRoastResumeToCloudnary(localFilePath)

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload resume to Cloudinary"
      })
    }

    // Extract text from PDF using Cloudinary URL
    const resumeText = await extractTextFromRoastPDF(cloudinaryResponse.url, true)

    // Get roast result
    const roastResult = await resumeRoastText(resumeText)

    return res.status(201).json({
      success: true,
      data: {
        roast: roastResult,
        resumeUrl: cloudinaryResponse.url
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = resumeRoast