const mongoose = require('mongoose');

const talentAlertSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  requiredSkills: {
    type: [String],
    required: true,
    validate: {
      validator: function (skills) {
        return skills.length > 0
      },
      message: 'At least one skill is required'
    }
  },
  minExperience: {
    type: Number,
    default: 0,
    min: 0
  },
  minFitScore: {
    type: Number,
    max: 100,
    min: 30,
    default: 80
  },
  location: {
    type: String,
    default: null
  },
  workMode: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid', null],
    default: null
  },
  matchedEmployee: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    },
    fitScore: {
      type: Number
    },
    resumeUrl: {
      type: String
    },
    employeeName: {
      type: String
    },
    employeeSkills: {
      type: [String]
    },
    employeeExperience: {
      type: Number
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },

}, { timestamps: true })

talentAlertSchema.index({ recruiter: 1, isActive: 1 })

const TalentAlert = mongoose.model('TalentAlert', talentAlertSchema);

module.exports = TalentAlert;