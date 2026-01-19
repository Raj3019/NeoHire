const { extractTextFromRoastPDF, resumeRoastText } = require("../utils/roast.utlis")
const { uploadRoastResumeToCloudnary } = require("../utils/cloudnary.utlis")
const fs = require('fs'); // ✅ Add this

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
    
    // ✅ Debug logs
    console.log('📁 File path:', localFilePath)
    console.log('📄 File exists:', fs.existsSync(localFilePath))
    console.log('📊 File size:', req.file.size)
    console.log('🔍 req.file:', req.file)

    // ✅ Check if file actually exists before uploading
    if (!fs.existsSync(localFilePath)) {
      return res.status(500).json({
        success: false,
        message: "File was not saved properly by multer"
      })
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await uploadRoastResumeToCloudnary(localFilePath)

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload resume to Cloudinary"
      })
    }

    console.log('☁️ Cloudinary URL:', cloudinaryResponse.url) // ✅ Debug

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
    console.error('❌ Error details:', error) // ✅ Better error logging
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = resumeRoast