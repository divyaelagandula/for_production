// utilss/redis.js (CORRECTED EXPORT)

const Redis = require('redis'); 
const host = require('os').hostname()
// 1. Create and configure the client
const redisClient = Redis.createClient({
    port: 6379, 
    host: `${host}`
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// 2. Add a .once() listener to log success only once (optional but clean)
redisClient.once('ready', () => {
    console.log('✅ Redis Client is Ready.');
});
(async () => {
    try {
        await redisClient.connect(); // Await the connection
        console.log('✅ Connected to Redis successfully.');
    } catch (err) {
        console.error('FATAL: Failed to initialize server:', err.message);
        process.exit(1); // Exit if critical connection fails
    }
})();


// 3. EXPORT THE CLIENT INSTANCE
module.exports = redisClient;