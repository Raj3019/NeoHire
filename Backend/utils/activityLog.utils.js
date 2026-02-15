const ActivityLog = require("../model/activityLog.model")

const logActivity = ({
  action,
  userId = null,
  userRole = 'system',
  resourceType = null,
  resourceId = null,
  description,
  metadata = {},
  ipAddress = null,
  method = null,
  endpoint = null,
  statusCode = null
}) => {
    ActivityLog.create({
    action,
    userId,
    userRole,
    resourceType,
    resourceId,
    description,
    metadata,
    ipAddress,
    method,
    endpoint,
    statusCode
  }).catch(err => {
    console.error('Failed to save activity log:', err.message)
  })
}

module.exports = {logActivity}