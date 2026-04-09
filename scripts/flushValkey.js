require('./webpack/utils/dotenv')
const Redis = require('ioredis')

const clearRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set, skipping Redis flush (using in-memory store)')
    return
  }
  // Files run by pm2 must be pure JS (not .ts).
  // The RedisInstance (TLS) logic is written in .ts, so we can't use TLS here
  const redis = new Redis(process.env.REDIS_URL, {
    connectionName: 'devRedis'
  })
  await redis.flushall()
  redis.disconnect()
}

const runMigrations = async () => {
  await clearRedis()
}

runMigrations()
