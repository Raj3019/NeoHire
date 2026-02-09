const Recruiter = require("../model/recruiter.model")

const checkRercuiterProfileComplete = async (req, res, next) => {
  try {
    const recruiter = await Recruiter.findOne({ betterAuthUserId: req.user.id });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" })
    }

    // Attach the actual recruiter MongoDB document to the request for downstream use
    req.recruiterDoc = recruiter;

    const requiredFields = [
      'fullName',
      'phone',
      'dateOfBirth',
      'gender',
      'currentCity',
      'state',
      'country',
      'skills',
      'zipCode',
      'resumeFileURL',
      'languages',
    ]

    const missingFields = []

    for (const field of requiredFields) {
      const value = recruiter[field]

      if (!value) {
        missingFields.push(field);
        continue
      }

      if (typeof value === 'string' && value.trim() === '') {
        missingFields.push(field);
        continue
      }

      if (Array.isArray(value) && value.length === 0) {
        missingFields.push(field);
      }
    }

    // Removed: education.tenth check (not required for recruiters)
    // Removed: education.graduation check (not required for recruiters)
    // Removed: jobPreferences.jobType check (not required for recruiters)
    // Removed: jobPreferences.workMode check (not required for recruiters)

    if (missingFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: "Please complete your profile before posting jobs",
        missingFields: missingFields,
        profileComplete: false
      })
    }

    next()
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: "Error checking profile", error: error.message })
  }
}

module.exports = checkRercuiterProfileComplete