import IORedis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redis = new IORedis({
  host: redisHost,
  port: redisPort,
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || undefined,
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
