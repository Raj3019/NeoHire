const express = require("express")
const autoApplyRouter = express.Router()
const { authenticateSession } = require("../middleware/auth.middleware");
const { getAutoApplyStatus, toggleAutoApply, runAutoApplyNow, getAutoApplyHistory } = require("../controller/autoApply.controller");

autoApplyRouter.use(authenticateSession);

// Check if auto-apply is enabled for the logged-in user
autoApplyRouter.get("/status", getAutoApplyStatus)

//Enable or disable auto-apply
autoApplyRouter.post("/toggle", toggleAutoApply)

//Manually trigger the CRON job (for testing)
autoApplyRouter.post("/run-now", runAutoApplyNow)

//history
autoApplyRouter.get("/history", getAutoApplyHistory)

module.exports = autoApplyRouter