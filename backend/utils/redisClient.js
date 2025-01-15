const redis = require("redis");

let redisClient;

(async () => {
  try {
    redisClient = redis.createClient();

    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
    });

    await redisClient.connect();
    console.log("Connected to Redis.");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

// Wrapper functions for better validation
const setWithExpiry = async (key, value, options = {}) => {
  const { EX } = options;
  try {
    await redisClient.set(key, value, { EX });
  } catch (err) {
    console.error("Error setting key in Redis:", err);
    throw new Error("Failed to store data in Redis.");
  }
};

const get = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) {
      throw new Error("Key not found or expired.");
    }
    return value;
  } catch (err) {
    console.error("Error retrieving key from Redis:", err);
    throw new Error("Failed to retrieve data from Redis.");
  }
};

module.exports = {
  redisClient,
  setWithExpiry,
  get,
};
