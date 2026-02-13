const Employee = require("../model/employee.model")
const Recruiter = require("../model/recruiter.model")

const checkUserStatus = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next()
    }

    const role = req.user.role

    if (role === 'Admin') {
      return next()
    }

    let userDoc = null

    if (role === 'Employee') {
      userDoc = await Employee.findOne({betterAuthUserId: req.user.id}).select("status fullName email")
    } else if(role === "Recruiter"){
      userDoc = await Recruiter.findOne({betterAuthUserId: req.user.id}).select("status fullName email")
    }

    if (!userDoc) {
      return next()
    }

    if (userDoc.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support for assistance",
        statusCode: "ACCOUNT_SUSPENDED"
      })
    }

    if (userDoc.status === 'Banned') {
      return res.status(403).json({
        success: false,
        message: "Your account has been permanently Banned. Please contact support for assistance",
        statusCode: "ACCOUNT_BANNED"
      })
    }

    next()
  } catch (error) {
    console.error("Status check middleware error:", error);
    return res.status(500).json({ message: "Internal server error during status check" });
  }
}

module.exports = {checkUserStatus}