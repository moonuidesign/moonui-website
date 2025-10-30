import IORedis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
// const redisPassword = process.env.REDIS_PASSWORD;

const redis = new IORedis({
  host: redisHost,
  port: redisPort,
  // password: redisPassword,
  lazyConnect: true,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('Terhubung ke Redis!');
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

export default redis;
