const express = require('express');
const notificationRouter = express.Router();
const notificationModel = require('../model/notification.model');
const { authenticateSession } = require('../middleware/auth.middleware');
const Employee = require('../model/employee.model');
const Recruiter = require('../model/recruiter.model');

// Helper function to get MongoDB _id from betterAuthUserId
const getMongoUserId = async (betterAuthUserId, role) => {
  if (role === 'Employee') {
    const employee = await Employee.findOne({ betterAuthUserId });
    return employee?._id;
  } else if (role === 'Recruiter') {
    const recruiter = await Recruiter.findOne({ betterAuthUserId });
    return recruiter?._id;
  } else if (role === 'Admin') {
    return betterAuthUserId;
  }
  return null;
};

// GET /api/notifications
notificationRouter.get('/', authenticateSession, async (req, res) => {
  try {
    const betterAuthUserId = req.user.id
    const userType = req.user.role
    const limit = parseInt(req.query.limit) || 50
    const skip = parseInt(req.query.skip) || 0

    // Convert betterAuthUserId to MongoDB _id
    const mongoUserId = await getMongoUserId(betterAuthUserId, userType);
    if (!mongoUserId) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin users don't have notifications stored in the same way
    if (userType === 'Admin') {
      return res.json({
        success: true,
        notifications: [],
        unreadCount: 0,
        total: 0
      });
    }

    const notifications = await notificationModel
      .find({
        recipient: mongoUserId,
        recipientModel: userType
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('relatedJob', 'title company') //Includes job details
      .populate('relatedApplication', 'status') // Includes application status

    //count unread notifications
    const unreadCount = await notificationModel.countDocuments({
      recipient: mongoUserId,
      recipientModel: userType,
      isRead: false
    })

    //count total notifications
    const total = await notificationModel.countDocuments({
      recipient: mongoUserId,
      recipientModel: userType
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      total
    })
  } catch (error) {
    console.error('Error fetching notifications: ', error);
    res.status(500).json({ message: error.message })
  }
})

// Patch /api/notification/:id/read
notificationRouter.patch('/:id/read', authenticateSession, async (req, res) => {
  try {
    // Convert betterAuthUserId to MongoDB _id
    const mongoUserId = await getMongoUserId(req.user.id, req.user.role);
    if (!mongoUserId) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin users don't have notifications
    if (req.user.role === 'Admin') {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = await notificationModel.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: mongoUserId // Ensure user owns this notification
      },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    res.json({ success: true, notification })
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
})

//PATCH /api/notification/read-all
//mark all notification as read for the logged-in user

notificationRouter.patch('/read-all', authenticateSession, async (req, res) => {
  try {
    // Convert betterAuthUserId to MongoDB _id
    const mongoUserId = await getMongoUserId(req.user.id, req.user.role);
    if (!mongoUserId) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin users don't have notifications, return success
    if (req.user.role === 'Admin') {
      return res.json({ success: true, message: "All notification marked as read" });
    }

    await notificationModel.updateMany(
      {
        recipient: mongoUserId,
        isRead: false
      },
      { isRead: true }
    )

    res.json({ success: true, message: "All notification marked as read" })
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
})


// DELETE /api/notification/:id
// Deletes a specific notification
notificationRouter.delete('/:id', authenticateSession, async (req, res) => {
  try {
    // Convert betterAuthUserId to MongoDB _id
    const mongoUserId = await getMongoUserId(req.user.id, req.user.role);
    if (!mongoUserId) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admin users don't have notifications
    if (req.user.role === 'Admin') {
      return res.status(404).json({ message: "Notification not found" });
    }

    const notification = await notificationModel.findOneAndDelete({
      _id: req.params.id,
      recipient: mongoUserId
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ success: true, message: "Notification deleted" })
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = notificationRouter