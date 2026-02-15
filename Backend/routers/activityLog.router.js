const express = require('express')
const activityLogRouter = express.Router()
const { isAdmin } = require('../middleware/adminAuth.middleware')
const { getLogs, getLogStats, deleteLogs } = require('../controller/activityLog.controller')

activityLogRouter.use(isAdmin)

activityLogRouter.get('/logs', getLogs)
activityLogRouter.get('/stats', getLogStats)
activityLogRouter.delete('/logs', deleteLogs)

module.exports = activityLogRouter