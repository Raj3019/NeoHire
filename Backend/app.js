const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectToDB = require('./database/config.database')
require('dotenv').config()
const PORT = process.env.PORT || 3000
const employeeRouter = require("./routers/employee.router")
const recuterRoute = require('./routers/recurter.router')
const jobRouter = require("./routers/job.router")
const applicationRouter = require("./routers/application.router")
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}))


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.use('/', employeeRouter)
app.use('/', recuterRoute)
app.use('/', jobRouter)
app.use('/', applicationRouter)


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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is Sucessfully connected on http://localhost:${PORT}`)
  })
}).catch((err) => {
  console.error(`Database cannot be connected!! : ${err}`)
})
