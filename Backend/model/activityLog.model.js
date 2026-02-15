const mongoose = require("mongoose")
const activityLogSchema = new mongoose.Schema({
  action:{
    type: String,
    required: true,
    index: true
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  userRole:{
    type: String,
    enum:['employee', 'recruiter', 'admin', 'system'],
    default: 'system'
  },
  resourceType: {
    type: String,
    default: null
  },
  resourceId:{
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  description:{
    type: String,
    required: true
  },
  metadata:{
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
    ipAddress: {
    type: String,
    default: null
  },
  method: {
    type: String,
    default: null
  },
  endpoint: {
    type: String,
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  },
}, {timestamps: true})

activityLogSchema.index({createdAt: -1}, {expireAfterSeconds: 7776000})

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)
module.exports = ActivityLog