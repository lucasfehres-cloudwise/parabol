import {type Lock, Redlock} from '@sesamecare-oss/redlock'
import type RedisInstance from './utils/RedisInstance'

export type LeaderRunnable = () => Promise<void> | void

export class LeaderRunner {
  redis: RedisInstance | any
  redlock: Redlock | null
  prefix: string
  lockTTL: number
  lock: Lock | null = null

  constructor(redis: RedisInstance | any, prefix: string, lockTTL: number) {
    this.redis = redis
    // Only use Redlock when real Redis is available; single-process deployments always run as leader
    this.redlock = process.env.REDIS_URL ? new Redlock([this.redis], {retryCount: 0}) : null
    this.prefix = prefix
    this.lockTTL = lockTTL
  }

  async runLocked(name: string, run: LeaderRunnable, skip: LeaderRunnable) {
    if (!this.redlock) {
      // No Redis → single process → always leader
      await run()
      return
    }
    try {
      await this.redlock.using([`${this.prefix}_${name}`], this.lockTTL, async () => {
        await run()
      })
    } catch {
      await skip()
    }
  }
}
