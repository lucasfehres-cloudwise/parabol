import type Redis from 'ioredis'
import InMemoryRedis from './InMemoryRedis'
import RedisInstance from './RedisInstance'

let redis: Redis
type RedisPipelineError = [Error, null]
type RedisPipelineSuccess<T> = [null, T]
export type RedisPipelineResponse<TSuccess> = RedisPipelineError | RedisPipelineSuccess<TSuccess>

const getRedis = () => {
  if (!redis) {
    if (process.env.REDIS_URL) {
      redis = new RedisInstance('getRedis')
    } else {
      redis = new InMemoryRedis('getRedis') as unknown as Redis
    }
  }
  return redis
}
export default getRedis
