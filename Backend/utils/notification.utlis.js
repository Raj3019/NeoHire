const notificationModel = require("../model/notification.model")

const createNotification = async(data) => {
  try {
    const notification = await notificationModel.create(data)
    return notification;
  } catch (error) {
    console.error('Error creating notification: ', error);
    throw error
  }
}

const sendRealTimeNotification = (io, userSockets, userId, notification) => {
  const socketId = userSockets.get(userId.toString())

  if(socketId){
    //user is online! send them notification
    //io.to(socketId) = Find the specific socket connection
    //.emit('newNotification', data) = send event with name 'newNotification'

    io.to(socketId).emit('newNotification', notification)
    console.log(`Real-time notification send to user ${userId}`);
  }else{
    console.log(`User ${userId} is offline. Notification saved to DB only`)
  }
}

module.exports = {createNotification, sendRealTimeNotification}