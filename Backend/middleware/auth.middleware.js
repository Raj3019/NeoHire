const { auth } = require("../lib/auth.lib")

//fromNodeHeaders converts Express request headers to Better Auth format
const { fromNodeHeaders } = require("better-auth/node")

const authenticateSession = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)  //convert express headers
    })

    if (!session) {
      return res.status(401).json({ error: "Access denied, not authenticated" })
    }

    req.user = session.user
    req.session = session.session

    next()
  } catch (error) {
    console.error("Session authenication error: ", error);
    return res.status(401).json({
      message: "Invalid or expired session",
      error: error.message
    })
  }
}

const authenticateRole = (requiredRole) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized user" })
  }

  if (req.user.role !== requiredRole) {
    console.log(`Role mismatch: User has ${req.user.role}, needs ${requiredRole}`);
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  }

  next()
}


module.exports = {
  authenticateSession,
  authenticateRole
}