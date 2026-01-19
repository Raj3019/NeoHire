const express = require('express')
const app = express()
const http = require('http')
const socketIO = require('socket.io')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectToDB = require('./database/config.database')
require('dotenv').config()
const PORT = process.env.PORT || 3000
const employeeRouter = require("./routers/employee.router")
const recruiterRoute = require('./routers/recruiter.router')
const jobRouter = require("./routers/job.router")
const applicationRouter = require("./routers/application.router")
const notificationRouter = require('./routers/notification.router')
const roastResumeRouter = require('./routers/resumeRoast.router')
const frontendURL = process.env.FRONTEND_URL

const server = http.createServer(app)

// Allow both public frontend URL and localhost for development
const allowedOrigins = [
  frontendURL,
  'https://www.neohire.site',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080'
].filter(Boolean);


const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User Connected: ', socket.id)

  socket.on('register', (userId) => {
    userSockets.set(userId.toString(), socket.id)
    console.log(`User ${userId} registered with socket ${socket.id}`);
    console.log(`Total online users: ${userSockets.size}`)
  })

  //Listen to disconnection

  socket.on('disconnect', () => {
    //Find which userID has this socket.id
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId)
        console.log(`User ${userId} disconnected`)
        console.log(`Total online users: ${userSockets.size}`)
        break;
      }
    }
  })
})

// make io and userSocket avalible to all controllers

app.set('io', io)
app.set('userSockets', userSockets)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.use('/api/employee', employeeRouter)
app.use('/api/recruiter', recruiterRoute)
app.use('/api/jobs', jobRouter)
app.use('/api/applications', applicationRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/try', roastResumeRouter)

app.get('/', (req, res) => {
  res.send("Hello World")
})

// app.listen(Port, () =>{
//   console.log(`Server is running on http://localhost:${Port}`)
// })

// Add multer error handler AFTER all routes
app.use((err, req, res, next) => {
  console.log('Error caught:', err);
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Something went wrong!' });
});

connectToDB().then(() => {
  console.log("Database connection established...")
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is Sucessfully connected on http://localhost:${PORT}`)
  })
}).catch((err) => {
  console.error(`Database cannot be connected!! : ${err}`)
})
