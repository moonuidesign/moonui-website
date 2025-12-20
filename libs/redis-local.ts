import IORedis from 'ioredis';

// Debug: Check if variables are actually loaded
console.log('Connecting to Redis Host:', process.env.REDIS_HOST);

const redis = new IORedis({
  host: process.env.REDIS_HOST, // Use the variable directly
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('✅ Terhubung ke Redis!');
});

redis.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

export default redis;
