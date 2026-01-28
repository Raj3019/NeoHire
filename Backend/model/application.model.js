// Application model

const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },
  JobSeeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recruiter",
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Applied", "Pending", "Shortlist", "Accept", "Reject"],
    default: "Applied",
    required: true
  },
  aiMatchScore: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    experienceMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    educationMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    calculatedAt: {
      type: Date,
      default: Date.now
    },
    insights: {
      type: String
    },
    matchedSkills: [String],
    missingSkills: [String],
  },
  appliedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  appliedVia: {
    type: String,
    enum: ['manual', 'auto-apply'],
    default: "manual"
  }
}, { timestamps: true })

const Application = mongoose.model("Application", applicationSchema)

module.exports = Application