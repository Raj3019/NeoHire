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

const registerEmployee = async (req, res) => {
  try {

    const validateBody = EmployeeRegisterValidation.safeParse(req.body)

    // if(!validateBody.success){
    //   return res.status(400).json({error: validateBody.error})
    // }

    if (!validateBody.success) {
      const errors = validateBody.error.issues[0].message
      return res.status(400).json({
        message: errors
      })
    }

    const {
      email,
      password,
      fullName
    } = validateBody.data;

    const checkEmail = await Employee.findOne({ email })
    if (checkEmail) {
      return res.status(409).json({ message: "Employee with this email already exists" });
    }


    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)


    const passwordHash = await bcrypt.hash(password, 10)
    const employee = new Employee({
      email,
      fullName,
      password: passwordHash,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false
    })

    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email/employee/${verificationToken}`;

    await sendVerificationEmail(email, verificationLink, fullName)

    // const token = jwt.sign({id: employee._id, role: employee.role}, jwtToken, {expiresIn: "1hr"})

    await employee.save()

    // Set HTTP-only cookie with secure SameSite settings for cross-site contexts
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    // })

    res.status(200).json({
      "message": "Registration successful! Please check your email to verify your account.",
      user: {
        id: employee._id,
        email: employee.email,
        role: employee.role
      }
    })

    // res.status(200).json({ "message": "Employee sucessfully created" , token})
  } catch (error) {
    // console.log(error)
    res.status(400).send({ message: error.message })
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const employee = await Employee.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    })

    if (!employee) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      })
    }

    // Check if already verified
    if (employee.isVerified) {
      return res.status(400).json({
        message: 'Email already verified. You can login now.'
      });
    }

    employee.isVerified = true
    employee.verificationToken = null
    employee.verificationTokenExpiry = null
    await employee.save()

    res.status(200).json({
      message: 'Email verified sucessfully! you can now login.'
    });
  } catch (error) {
    console.error('Verification error: ', error);
    res.status(500).json({ message: 'Server error during verification: ', error: error.message })
  }
}

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const employee = await Employee.findOne({ email })

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    if (employee.isVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    employee.verificationToken = verificationToken
    employee.verificationTokenExpiry = verificationTokenExpiry
    await employee.save()

    //send new verfication mail
    const verificationLink = `${process.env.FRONTEND_URL || 'http:localhost:3001'}/verify-email/employee/${verificationToken}`
    await sendVerificationEmail(email, verificationLink, employee.fullName)

    res.status(200).json({ message: 'Verfication email resent Successfully' })
  } catch (error) {
    console.error('Resend verfication error', error);
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}


const loginEmployee = async (req, res) => {
  try {

    const validateBody = EmployeeLoginValidation.safeParse(req.body)

    if (!validateBody.success) {
      const errors = validateBody.error.issues[0].message
      return res.status(400).json({ message: errors })
    }

    const { email, password } = validateBody.data;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (!employee.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        needsVerification: true
      })
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: employee._id, role: employee.role }, jwtToken, { expiresIn: "1hr" })
    // return res.status(200).json({ message: "Login Successful" , token});

    // Set cookie with secure and SameSite=None in production so cross-site frontends receive it
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      message: 'Login Successfully',
      user: {
        id: employee._id,
        email: employee.email,
        role: employee.role
      }
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login Error" });
  }
};


const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file Uploaded' })
    }

    const employeeId = req.user.id
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.profilePicturePublicId) {
      await deleteFromCloudinary(employee.profilePicturePublicId)
    }

    const result = await uploadToCloudinary(req.file.path)

    // Use findByIdAndUpdate to only update profile picture fields without triggering full document validation
    await Employee.findByIdAndUpdate(
      employeeId,
      {
        profilePicture: result.url,
        profilePicturePublicId: result.public_id
      },
      { runValidators: false } // Skip validation since we're only updating profile picture fields
    );

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Profile picture uploaded sucessfully",
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
    const employee = await Employee.findById(employeeId)

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
    // console.log(user.id)

    const employee = await Employee.findById(user.id).select('-password')
    if (!employee) {
      return res.status(401).json({ message: "Employee with this id not found" })
    }
    // const appliedJob = employee.appliedJobs
    const recentApplication = await Application.find({ JobSeeker: user.id }).sort({ appliedAt: -1 })
      .populate('job', 'title companyName location workType jobType salary status')
      .select('job status appliedAt aiMatchScore resume') // Include aiMatchScore

    const recentApplicationJob = recentApplication ? recentApplication : null
    return res.status(200).json({ data: employee, recentApplicationJob })
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
    const employee = await Employee.findById(req.user.id)
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



const logoutEmployee = async (req, res) => {
  try {
    const employee = req.user;

    if (!employee) {
      return res.status(401).json({ message: "Employee not found" })
    }

    // Clear cookie using same attributes to ensure browser removes it
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    })
    return res.status(201).json({ message: "logout sucessfully" })

  } catch (err) {
    return res.status(401).json({ message: "Logout failed" })
  }
}


module.exports = {
  registerEmployee,
  verifyEmail,
  resendVerificationEmail,
  loginEmployee,
  profileEmployee,
  editEmployee,
  uploadResume,
  uploadProfilePicture,
  employeeDashboard,
  getMyApplications,
  getApplicationById,
  logoutEmployee,
  recommendJobToEmployee
  // setupEmployee
}