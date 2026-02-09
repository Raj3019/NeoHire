const rateLimit = require("express-rate-limit")

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  message: {
    success: false,
    message: 'Too many request, Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Application limit reached. Try again in sometime'
  }
})

// Resume and profile pic upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached. Try again later.'
  }
});

// Job posting limiter (for recruiters)
const jobPostLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,  // 24 hours
  max: 2,                         // 10 job posts per day
  message: {
    success: false,
    message: 'Daily job posting limit reached.'
  }
});

// Resume roast limiter (AI-intensive)
const roastLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,  // 24 hour
  max: 2,                     // 2 roasts per hour
  message: {
    success: false
  }
});

module.exports = {
  generalLimiter,
  applicationLimiter,
  uploadLimiter,
  jobPostLimiter,
  roastLimiter
}