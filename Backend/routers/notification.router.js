const express = require('express');
const notificationRouter = express.Router();
const notificationModel = require('../model/notification.model');
const { authenticateJWT } = require('../middleware/auth.middleware');


// GET /api/notifications
notificationRouter.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const userType = req.user.role
    const limit = parseInt(req.query.limit) || 50
    const skip = parseInt(req.query.skip) || 0

    const notifications = await notificationModel
    .find({
      recipient: userId,
      recipientModel: userType
    })
    .sort({createdAt: -1})
    .limit(limit)
    .skip(skip)
    .populate('relatedJob', 'title company') //Includes job details
    .populate('relatedApplication', 'status') // Includes application status

    //count unread notifications
    const unreadCount = await notificationModel.countDocuments({
      recipient: userId,
      recipientModel: userType,
      isRead: false
    })

    //count total notifications
    const total = await notificationModel.countDocuments({
      recipient: userId,
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
    res.status(500).json({message: error.message})
  }
})

// Patch /api/notification/:id/read
notificationRouter.patch('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const notification = await notificationModel.findByIdAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id // Ensure user owns this notification
      },
      {isRead: true},
      {new: true}
    )

    if(!notification){
      return res.status(404).json({message: 'Notification not found'})
    }
    res.json({success: true, notification})
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
})

//PATCH /api/notification/read-all
//mark all notification as read for the logged-in user

notificationRouter.patch('/read-all', authenticateJWT, async (req, res) => {
  try {
    await notificationModel.updateMany(
      {
        recipient: req.user.id,
        isRead: false
      },
      {isRead: true}
    )

    res.json({success: true, message: "All notification marked as read"})
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
})


// DELETE /api/notification/:id
// Deletes a specific notification
notificationRouter.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const notification = await notificationModel.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    })

    if(!notification){
      return res.status(404).json({message: "Notification not found"})
    }

    res.json({success: true, message: "Notification deleted"})
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = notificationRouter