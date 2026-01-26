const { auth } = require("../lib/auth.lib")
const { fromNodeHeaders } = require("better-auth/node")

const isAdmin = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    })

    if (!session || !session.user || session.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      })
    }

    req.user = session.user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}

module.exports = { isAdmin }