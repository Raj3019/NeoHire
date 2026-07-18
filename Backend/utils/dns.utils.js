const dns = require('node:dns');

/**
 * Optionally override Node's DNS resolvers before MongoDB clients are created.
 * Useful on networks whose default DNS server refuses MongoDB Atlas SRV queries.
 */
const configureDnsServers = () => {
  const configuredServers = process.env.MONGODB_DNS_SERVERS;
  if (!configuredServers) return [];

  const servers = configuredServers
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    throw new Error('MONGODB_DNS_SERVERS must contain at least one DNS server address.');
  }

  dns.setServers(servers);
  return servers;
};

module.exports = { configureDnsServers };
