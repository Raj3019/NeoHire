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
const { auth, client } = require("./lib/auth.lib")
const { toNodeHandler } = require("better-auth/node")
const adminRouter = require('./routers/admin.router')
const autoApplyRouter = require('./routers/autoApply.router')
const { initAutoApplyCron } = require("./services/autoApplyCron.services");
const { initTalentRadarCron } = require("./services/talentRadarCron.services");
const { generalLimiter } = require("./middleware/rateLimit.middleware")
// const planRouter = require('./routers/plan.router')
// const subscriptionRouter = require('./routers/subscription.router')
const talentRadarRouter = require('./routers/talentRadar.router')
const Employee = require('./model/employee.model')
const Recruiter = require('./model/recruiter.model')
const { requestLogger } = require('./middleware/activityLog.middleware')
const activityLogRouter = require('./routers/activityLog.router')
const { logActivity } = require('./utils/activityLog.utils')

const frontendURL = process.env.FRONTEND_URL

const server = http.createServer(app)

// Allow both public frontend URL and localhost for development
const allowedOrigins = [
  frontendURL,
  'https://www.neohire.site',
  'https://neohire.site',
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
    if (!userId) {
      console.log('Register event received without userId');
      return;
    }
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
initAutoApplyCron(io, userSockets)
initTalentRadarCron(io, userSockets)

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
app.use('/api', generalLimiter)

// toNodeHandler -> Converts our auth instance to an Express-compatible handler

// Pre-login interceptor: Block suspended/banned users BEFORE Better Auth creates a session
app.post('/api/auth/sign-in/email', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next();

    const lowerEmail = email.toLowerCase().trim();

    // Check both collections for this email
    const employee = await Employee.findOne({ email: lowerEmail }).select('status');
    const recruiter = await Recruiter.findOne({ email: lowerEmail }).select('status');

    const userDoc = employee || recruiter;

    // Get actual role from Better Auth user collection (source of truth)
    const db = client.db();
    const authUser = await db.collection('user').findOne({ email: lowerEmail });
    const actualRole = authUser?.role?.toLowerCase() || (employee ? 'employee' : recruiter ? 'recruiter' : 'system');

    if (userDoc && userDoc.status === 'Suspended') {
      logActivity({
        action: 'LOGIN_BLOCKED_SUSPENDED',
        userId: userDoc._id,
        userRole: actualRole,
        description: `Login blocked for suspended account: ${lowerEmail}`,
        ipAddress: req.ip,
        method: 'POST',
        endpoint: '/api/auth/sign-in/email',
        statusCode: 403
      })
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support for assistance.',
        statusCode: 'ACCOUNT_SUSPENDED'
      });
    }

    if (userDoc && userDoc.status === 'Banned') {
      logActivity({
        action: 'LOGIN_BLOCKED_BANNED',
        userId: userDoc._id,
        userRole: actualRole,
        description: `Login blocked for banned account: ${lowerEmail}`,
        ipAddress: req.ip,
        method: 'POST',
        endpoint: '/api/auth/sign-in/email',
        statusCode: 403
      })
      return res.status(403).json({
        success: false,
        message: 'Your account has been permanently banned. Please contact support.',
        statusCode: 'ACCOUNT_BANNED'
      });
    }

    // User is Active (or not found — let Better Auth handle invalid credentials)
    logActivity({
      action: 'USER_LOGIN',
      userId: userDoc?._id || null,
      userRole: actualRole,
      description: `Login attempt by ${lowerEmail}`,
      ipAddress: req.ip,
      method: 'POST',
      endpoint: '/api/auth/sign-in/email',
      statusCode: 200
    })
    next();
  } catch (error) {
    console.error('Pre-login status check error:', error);
    // Don't block login on errors — let Better Auth handle it
    next();
  }
});

app.get('/api/auth/callback/google', async (req, res, next) => {
  try {
    next()
  } catch (error) {
    console.error("Google OAuth status check error: ", error)
    next()
  }
})

// Set role for Google OAuth users after callback
app.post('/api/auth/set-role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['Employee', 'Recruiter'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be Employee or Recruiter.' });
    }

    // Get session from Better Auth using the request cookies
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = session.user;

    // Check if user already has a profile (prevent role switching)
    const existingEmployee = await Employee.findOne({ betterAuthUserId: user.id });
    const existingRecruiter = await Recruiter.findOne({ betterAuthUserId: user.id });

    if (existingEmployee || existingRecruiter) {
      // User already has a profile — determine their existing role
      const existingRole = existingEmployee ? 'Employee' : 'Recruiter';
      if (existingRole !== role) {
        return res.status(403).json({
          success: false,
          message: `This Google account is already registered as ${existingRole === 'Employee' ? 'a Candidate' : 'a Recruiter'}. You cannot switch roles.`,
          existingRole
        });
      }
      // Same role — just return success (login flow)
      logActivity({
        action: 'GOOGLE_LOGIN',
        userId: (existingEmployee || existingRecruiter)._id,
        userRole: existingRole.toLowerCase(),
        description: `Google login: ${user.email} as ${existingRole}`,
        ipAddress: req.ip,
        method: 'POST',
        endpoint: '/api/auth/set-role'
      })
      return res.json({ success: true, role: existingRole, isExisting: true });
    }

    // No profile exists — create one (new sign-up via Google)
    const profileName = user.name || '';
    const profilePicture = user.image || '';

    if (role === 'Employee') {
      await Employee.create({
        betterAuthUserId: user.id,
        email: user.email,
        fullName: profileName,
        profilePicture,
        status: 'Active'
      });
    } else {
      await Recruiter.create({
        betterAuthUserId: user.id,
        email: user.email,
        fullName: profileName,
        profilePicture,
        status: 'Active'
      });
    }

    // Update the user's role in Better Auth's user collection
    const db = client.db();
    await db.collection('user').updateOne(
      { _id: user.id },
      { $set: { role } }
    );

    logActivity({
      action: 'GOOGLE_SIGNUP',
      userRole: role.toLowerCase(),
      description: `New Google signup: ${user.email} as ${role}`,
      metadata: { name: profileName, email: user.email },
      ipAddress: req.ip,
      method: 'POST',
      endpoint: '/api/auth/set-role'
    })

    return res.json({ success: true, role, isExisting: false });
  } catch (error) {
    console.error('Set role error:', error);
    return res.status(500).json({ success: false, message: 'Failed to set role.' });
  }
});

app.all('/api/auth/*path', toNodeHandler(auth))
app.use(requestLogger)
app.use('/api/employee', employeeRouter)
app.use('/api/recruiter', recruiterRoute)
app.use('/api/jobs', jobRouter)
app.use('/api/applications', applicationRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/try', roastResumeRouter)
app.use('/api/admin', adminRouter)
app.use('/api/activity', activityLogRouter)
app.use('/api/auto-apply', autoApplyRouter)
// app.use('/api/plans', planRouter)
// app.use('/api/subscriptions', subscriptionRouter)
app.use('/api/talent-radar', talentRadarRouter)

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
