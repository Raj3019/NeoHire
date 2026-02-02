//Recruiter Model

const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    betterAuthUserId:{
      type: String,
      required: true,
      unique: true
    },
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    headline: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    profilePicturePublicId: {
      type: String,
    },
    phone: {
      type: String,
      maxlength: 10,
    },
    dateOfBirth: {
      type: Date,
    },
    currentCity: {
      type: String,
    },
    area: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
      default: "India",
    },
    zipCode: {
      type: String,
    },
    about: {
      type: String,
    },
    role: {
      type: String,
      default: "Recruiter",
    },
    status:{
		type: String,
		enum: ["Active", "Suspended", "Banned"],
		default: "Active"
	},
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    education: {
      tenth: {
        schoolName: String,
        board: {
          type: String,
          enum: ["CBSE", "ICSE", "State Board", "Other", ""],
        },
        percentage: Number,
        grade: String,
        passingYear: Number,
        city: String,
        state: String,
      },
      juniorCollege: {
        collegeName: String,
        board: {
          type: String,
          enum: ["CBSE", "ICSE", "State Board", "Other", ""],
        },
        stream: {
          type: String,
          enum: ["Science", "Commerce", "Arts", "Other", ""],
        },
        percentage: Number,
        grade: String,
        passingYear: Number,
        city: String,
        state: String,
      },
      graduation: {
        collegeName: String,
        university: String,
        degree: {
          type: String,
        },
        specialization: String,
        percentage: Number,
        cgpa: Number,
        passingYear: Number,
        city: String,
        state: String,
      },
      postGraduation: {
        collegeName: String,
        university: String,
        degree: {
          type: String,
        },
        specialization: String,
        percentage: Number,
        cgpa: Number,
        passingYear: Number,
        city: String,
        state: String,
      },
      phd: {
        university: String,
        fieldOfStudy: String,
        thesisTitle: String,
        year: Number,
      },
    },
    workExperience: [
      {
        jobTitle: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        currentlyWorking: {
          type: Boolean,
          default: false,
        },
        description: String,
      },
    ],
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Native"],
        },
      },
    ],
    certifications: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        expiryDate: Date,
        credentialURL: String,
      },
    ],
    currentRole: {
      type: String,
    },
    currentEmployer: {
      type: String,
    },
    companyURL: {
      type: String,
    },
    totalHires: {
      type: Number,
      default: 0,
    },
    socials: {
      linkedin: String,
      twitter: String,
    },
    resumeFileURL: {
      type: String,
    },
    resumePublicLinkId: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    preferences: {
      industries: [String],
      jobTypes: [String],
    },
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    currentSubscription:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        default: null
      },
      currentPlan:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        default: null
      },
      planExpiresAt:{
        type: Date,
        default: null
      },
      isFreeTier:{
        type: Boolean,
        default: true
      }
  },
  { timestamps: true },
);

const Recruiter = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiter;
