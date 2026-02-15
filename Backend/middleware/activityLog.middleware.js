const { logActivity } = require("../utils/activityLog.utils");

const requestLogger = (req, res, next) => {
  const skipPaths = ["/api/health", "/favicon.ico"];
  if (skipPaths.some((path) => req.originalUrl.includes(path))) {
    return next();
  }

  if (req.method === "GET") {
    return next();
  }

  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const userId = req.user?._id || req.user?.id || null;
    const userRole = req.user?.role?.toLowerCase() || 'system'
    const action = `${req.method}_${req.originalUrl.split("?")[0].replace(/\//g, "_").toUpperCase()}`;
    logActivity({
      action,
      userId,
      userRole,
      description: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
      metadata: {
        duration: `${duration}ms`,
        userAgent: req.headers["user-agent"],
      },
      ipAddress: req.ip,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
    });
  });
  next();
};

module.exports = { requestLogger };
