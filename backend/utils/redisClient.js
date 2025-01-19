const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      // Optional: password if required
      // password: process.env.REDIS_PASSWORD
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    // Promisify methods for easier async/await usage
    this.get = promisify(this.client.get).bind(this.client);
    this.set = promisify(this.client.set).bind(this.client);
    this.del = promisify(this.client.del).bind(this.client);
    this.expire = promisify(this.client.expire).bind(this.client);
  }

  // Store token with expiration
  async storeToken(key, value, expirationInSeconds = 86400) { // 1 day default
    await this.set(key, value);
    await this.expire(key, expirationInSeconds);
  }

  // Get token
  async getToken(key) {
    return await this.get(key);
  }

  // Delete token
  async deleteToken(key) {
    return await this.del(key);
  }

  // Blacklist token (for logout)
  async blacklistToken(token, expirationInSeconds = 86400) {
    await this.set(`blacklist:${token}`, 'true');
    await this.expire(`blacklist:${token}`, expirationInSeconds);
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(token) {
    const isBlacklisted = await this.get(`blacklist:${token}`);
    return isBlacklisted === 'true';
  }
}

module.exports = new RedisClient();