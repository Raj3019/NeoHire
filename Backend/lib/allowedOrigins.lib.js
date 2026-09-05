// Single source of truth for the origins we trust (Express CORS, Socket.IO and better-auth).
// Both the apex and www hosts are listed because the site is reachable on either.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://www.neohire.site',
  'https://neohire.site',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080'
].filter(Boolean).map((origin) => origin.replace(/\/$/, ''));

module.exports = { allowedOrigins: [...new Set(allowedOrigins)] };
