const express = require('express');
const talentRadarRouter = express.Router();

const {
  createAlert,
  getMyAlerts,
  updateAlert,
  deleteAlert,
  toggleAlert,
  getMatchedEmployees,
  toggleTalentRadarOptIn
} = require('../controller/talentRadar.controller');

const { authenticateSession, authenticateRole } = require('../middleware/auth.middleware');

// Create a new talent alert
talentRadarRouter.post(
  '/alerts',
  authenticateSession,
  authenticateRole('Recruiter'),
  createAlert
);

// Get all my alerts
talentRadarRouter.get(
  '/alerts',
  authenticateSession,
  authenticateRole('Recruiter'),
  getMyAlerts
);

// Update an alert
talentRadarRouter.put(
  '/alerts/:alertId',
  authenticateSession,
  authenticateRole('Recruiter'),
  updateAlert
);

// Delete an alert
talentRadarRouter.delete(
  '/alerts/:alertId',
  authenticateSession,
  authenticateRole('Recruiter'),
  deleteAlert
);

// Toggle alert active status (pause/resume)
talentRadarRouter.patch(
  '/alerts/:alertId/toggle',
  authenticateSession,
  authenticateRole('Recruiter'),
  toggleAlert
);

// Get matched employees for an alert
talentRadarRouter.get(
  '/alerts/:alertId/matches',
  authenticateSession,
  authenticateRole('Recruiter'),
  getMatchedEmployees
);

// Toggle talent radar opt-in (for candidates)
talentRadarRouter.put(
  '/opt-in',
  authenticateSession,
  authenticateRole('Employee'),
  toggleTalentRadarOptIn
);

module.exports = talentRadarRouter;