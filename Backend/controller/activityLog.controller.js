const ActivityLog = require("../model/activityLog.model")
const { logActivity } = require("../utils/activityLog.utils")

const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userRole,
      method,
      startDate,
      endDate,
      search
    } = req.query
    const filter = {}
    if (action) filter.action = { $regex: action, $options: 'i' }
    if (userRole) filter.userRole = userRole
    if (method) filter.method = method
    if (search) {
      filter.description = { $regex: search, $options: 'i' }
    }

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filter)
    ])
    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalLogs: total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs' })
  }
}

const getLogStats = async (req, res) => {
  try {
    const { days = 7 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))
    const stats = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    const totalLogs = await ActivityLog.countDocuments({
      createdAt: { $gte: startDate }
    })
    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        actionBreakdown: stats,
        period: `Last ${days} days`
      }
    })
  } catch (error) {
    console.error('Error fetching log stats:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch log stats' })
  }
}

const deleteLogs = async (req, res) => {
  try {
    const { days } = req.body

    if (days === undefined || days === null) {
      return res.status(400).json({ success: false, message: 'Please specify number of days' })
    }

    const cutoffDate = new Date()
    const deleteParams = {}

    if (parseInt(days) > 0) {
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days))
      deleteParams.createdAt = { $lte: cutoffDate }
    }

    const result = await ActivityLog.deleteMany(deleteParams)

    logActivity({
      action: 'ADMIN_PURGE_LOGS',
      userId: req.user?._id,
      userRole: 'admin',
      description: `Admin purged ${result.deletedCount} logs older than ${days} days`,
      metadata: { deletedCount: result.deletedCount, requestedDays: days },
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200
    })

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} activity logs.`
    })
  } catch (error) {
    console.error('Error deleting logs:', error)
    res.status(500).json({ success: false, message: 'Failed to delete logs' })
  }
}

module.exports = { getLogs, getLogStats, deleteLogs }