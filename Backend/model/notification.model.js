const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({

  //Who recived this notification
  recipient:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel',
  },

  recipientModel: {
    type: String,
    required: true,
    enum: ['Employee', 'Recuter']
  },

  // What Type of notification
  type:{
    type: String,
    required: true,
    enum: ['APPLICATION_RECEIVED', 'STATUS_CHANGED', 'JOB_POSTED']
  },

  // Notification Content
  title:{
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },

  relatedApplication:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },

  // Notification State
  isRead: {
    type: Boolean,
    default: false
  }
},{timestamps: true})


const notificationModel = mongoose.model("Notification", notificationSchema)

module.exports = notificationModel