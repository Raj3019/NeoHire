const Employee = require("../model/employee.model.js");
const Application = require("../model/application.model.js");
const Job = require("../model/job.model.js")
const { EmployeeRegisterValidation, EmployeeLoginValidation } = require("../utils/validation.utlis.js")
const fs = require("fs");
const crypto = require('crypto')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { deleteFromCloudinary, uploadToCloudinary, deleteResumeFromCloudinary, uploadResumeToCloudnary } = require("../utils/cloudnary.utlis.js");
const { sendVerificationEmail } = require("../utils/emailService.utlis.js");
const jwtToken = process.env.JWT_TOKEN_Secret
// const salt = process.env.SALT

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file Uploaded' })
    }

    const employeeId = req.user.id
    const employee = await Employee.findOne({ betterAuthUserId: employeeId })

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.profilePicturePublicId) {
      await deleteFromCloudinary(employee.profilePicturePublicId)
    }

    const result = await uploadToCloudinary(req.file.path)

    // Use findByIdAndUpdate to only update profile picture fields without triggering full document validation
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      {
        profilePicture: result.url,
        profilePicturePublicId: result.public_id
      },
      { runValidators: false, new: true }
    );

    fs.unlinkSync(req.file.path);

    // Verify the update was successful
    if (!updatedEmployee || updatedEmployee.profilePicture !== result.url) {
      return res.status(500).json({ message: "Failed to save profile picture to database" });
    }

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: result.url
    })

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // console.log(error);
    res.status(500).json({ message: error.message });
  }
}


const uploadResume = async (req, res) => {
  try {
    const employeeId = req.user.id
    const employee = await Employee.findOne({ betterAuthUserId: employeeId })

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.resumePublicLinkId) {
      await deleteResumeFromCloudinary(employee.resumePublicLinkId)
    }

    const result = await uploadResumeToCloudnary(req.file.path)

    // Use findByIdAndUpdate to only update resume fields without triggering full document validation
    await Employee.findByIdAndUpdate(
      employeeId,
      {
        resumeFileURL: result.url,
        resumePublicLinkId: result.public_id
      },
      { runValidators: false } // Skip validation since we're only updating resume fields
    );

    fs.unlinkSync(req.file.path)

    res.status(200).json({
      message: "Resume Uploaded Successfully",
      resumeLink: result.url
    })
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // console.log(error);
    res.status(500).json({ message: error.message });
  }
}

// const setupEmployee = async(req, res) => {
//   try {

//     const employeeId = req.user.id
//     const validateBody = EmployeeSetupValidation.safeParse(req.body)


//     if(!validateBody.success){
//       return res.status(400).json({error: validateBody.error})
//     }

//     const updateData = req.body

//     const employee = await Employee.findByIdAndUpdate(employeeId, {$set: updateData}, {new: true})

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     await employee.save();

//     res.status(200).json({message: "Setup Done Sucessfully"})

//   } catch (err) {
//     console.log(err)
//     return res.status(401).josn({message: "Unable to setup employee"})
//   }
// }

const profileEmployee = async (req, res) => {
  try {
    const user = req.user

    const employee = await Employee.findOne({ betterAuthUserId: req.user.id }).select('-password')
    if (!employee) {
      return res.status(401).json({ message: "Employee with this id not found" })
    }

    // FIX: Use employee._id (MongoDB ObjectId) instead of user.id (Better Auth string)
    const recentApplication = await Application.find({ JobSeeker: employee._id }).sort({ appliedAt: -1 })
      .populate('job', 'title companyName location workType jobType salary status')
      .select('job status appliedAt aiMatchScore resume appliedVia')

    const recentApplicationJob = recentApplication ? recentApplication : null

    // Include role from the authenticated user (Better Auth session)
    return res.status(200).json({
      data: {
        ...employee.toObject(),
        role: req.user.role  // This comes from Better Auth session
      },
      recentApplicationJob
    })
  } catch (err) {
    return res.status(401).json({ message: "Employee profile not found" })
  }
}


const editEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Check if req.body exists and has data
    if (!req.body) {
      return res.status(400).json({ message: "No data provided to update" })
    }

    // Hash password if it's being updated
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }

    const employee = await Employee.findByIdAndUpdate(employeeId, req.body, { new: true }).select('-password')

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    return res.status(200).json({ data: employee, message: "Employee updated sucessfully" })

  } catch (err) {
    // console.log(err)
    res.status(500).json({ message: "Unable to update employee", error: err.message })
  }
}

// const uploadResume = async(req, res) => {
//   try{
//     const employeeId = req.params.id

//     if(!employeeId){
//       res.status(404).json({message: "Employee not found"})
//     }

//     if (!req.file) {
//           return res.status(400).json({ message: 'No file uploaded' });
//     }

//     res.status(201).json({message:"Uploaded Successfully", file: req.file})
//   }catch(err){
//     return res.status(401).json({message: "Unable to upload resume"})
//   }
// }

const employeeDashboard = async (req, res) => {
  try {
    //fetch all the applied jobs 
    const employeeId = req.user.id

    if (!employeeId) {
      return res.status(401).json({ message: "Unable to fetch employee details" })
    }

    const jobs = await Application.find({ JobSeeker: employeeId }).populate("job")
    const appliedJob = jobs.map(app => app.job)

    return res.status(200).json({ data: appliedJob, message: "Fetched all the applied job" })

  } catch (err) {
    // console.log(err)
    return res.status(401).json({ message: "Unable to fetch dashboard data", error: err.message })
  }
}


// Get employee's applications

const getMyApplications = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const applicants = await Application.find({ JobSeeker: employeeId })
      .populate('job', 'title companyName location workType jobType salary status')
      .sort({ appliedAt: -1 })

    return res.status(200).json({
      success: true,
      count: applicants.length,
      data: applicants
    })
  } catch (err) {
    // console.log(err)
    return res.status(500).json({
      message: "Failed to fetch applications",
      error: err.message
    })
  }
}

//get single application details
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const employeeId = req.user.id

    const application = await Application.findOne({
      _id: applicationId,
      JobSeeker: employeeId
    }).populate('job', 'title companyName location status workType')
      .populate('postedBy', 'fullName companyName email phone')

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found"
      })
    }

    return res.status(200).json({
      sucess: true,
      data: application
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Failed tp fetch application",
      error: err.message
    })
  }
}


//Recommendation

const recommendJobToEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ betterAuthUserId: req.user.id })
    const employeeSkills = employee.skills

    const appliedJobs = await Application.find({ JobSeeker: employee }).select('job')
    const appliedJobIds = appliedJobs.map(app => app.job)

    const jobs = await Job.find({
      _id: { $nin: appliedJobIds },
      status: "Active"
    }).select('_id skillsRequired').sort({ createdAt: -1 })

    // const allSkills = jobSkills.map((skill) => ({
    //   id: skill._id,
    //   skillRequired: skill.skillsRequired
    // }))

    // const matchSkills = employeeSkills.filter(skill => {
    //   return allSkills.some(job => job.jobSkill.includes(skill))
    // })

    const recommendedJobs = jobs.filter(job => {
      return job.skillsRequired.some(skill => employeeSkills.includes(skill))
    })

    const jobId = recommendedJobs.map(job => job._id)

    return res.status(200).json({
      success: true,
      count: recommendedJobs.length,
      recommendedJobs: jobId
    })

    // return res.status(200).json({
    //   sucess: true,
    //   // matchSkills: matchSkills,
    //   recommendedJobs: allSkills.filter(job => 
    //     job.skillRequired.some(skill => employeeSkills.includes(skill))
    //   )
    // })

  } catch (err) {
    return res.status(401).json({ message: "Recommendation Failed", error: err.message })
  }
}


module.exports = {
  profileEmployee,
  editEmployee,
  uploadResume,
  uploadProfilePicture,
  employeeDashboard,
  getMyApplications,
  getApplicationById,
  recommendJobToEmployee
  // setupEmployee
}