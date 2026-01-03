import IORedis from 'ioredis';

const redisClient = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export default redisClient;
export const cacheClient = redisClient;
