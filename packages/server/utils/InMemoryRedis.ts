import {EventEmitter} from 'events'
import {Logger} from './Logger'

/**
 * In-memory Redis replacement for single-process deployments.
 * Implements the subset of the ioredis API used by Parabol.
 * Used when REDIS_URL is not configured.
 */
export default class InMemoryRedis extends EventEmitter {
  private store = new Map<string, string>()
  private expiries = new Map<string, NodeJS.Timeout>()
  private listStore = new Map<string, string[]>()
  status = 'ready'

  constructor(connectionName?: string) {
    super()
    if (connectionName) {
      Logger.log(`InMemoryRedis: created in-memory store for "${connectionName}"`)
    }
    // Emit ready event async to match ioredis behavior
    setTimeout(() => this.emit('ready'), 0)
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null
  }

  async set(key: string, value: string, ...args: any[]): Promise<'OK' | null> {
    // Handle PX (millisecond TTL) and EX (second TTL) and NX (only if not exists)
    let ttlMs: number | undefined
    let nx = false
    for (let i = 0; i < args.length; i++) {
      const arg = typeof args[i] === 'string' ? args[i].toUpperCase() : args[i]
      if (arg === 'PX' && args[i + 1] !== undefined) {
        ttlMs = Number(args[i + 1])
        i++
      } else if (arg === 'EX' && args[i + 1] !== undefined) {
        ttlMs = Number(args[i + 1]) * 1000
        i++
      } else if (arg === 'NX') {
        nx = true
      }
    }
    if (nx && this.store.has(key)) {
      return null
    }
    this.store.set(key, value)
    if (ttlMs !== undefined) {
      this.clearExpiry(key)
      this.expiries.set(
        key,
        setTimeout(() => {
          this.store.delete(key)
          this.expiries.delete(key)
        }, ttlMs)
      )
    }
    return 'OK'
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0
    for (const key of keys) {
      if (this.store.delete(key)) count++
      this.clearExpiry(key)
    }
    return count
  }

  async exists(...keys: string[]): Promise<number> {
    return keys.filter((key) => this.store.has(key)).length
  }

  async pttl(key: string): Promise<number> {
    if (!this.store.has(key)) return -2
    // -1 means the key exists but has no associated expiry
    return -1
  }

  async ttl(key: string): Promise<number> {
    const pttl = await this.pttl(key)
    if (pttl < 0) return pttl
    return Math.ceil(pttl / 1000)
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return keys.map((key) => this.store.get(key) ?? null)
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    return Array.from(this.store.keys()).filter((key) => regex.test(key))
  }

  async incr(key: string): Promise<number> {
    const current = parseInt(this.store.get(key) || '0', 10)
    const next = current + 1
    this.store.set(key, String(next))
    return next
  }

  async incrby(key: string, increment: number): Promise<number> {
    const current = parseInt(this.store.get(key) || '0', 10)
    const next = current + increment
    this.store.set(key, String(next))
    return next
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.store.has(key)) return 0
    this.clearExpiry(key)
    this.expiries.set(
      key,
      setTimeout(() => {
        this.store.delete(key)
        this.expiries.delete(key)
      }, seconds * 1000)
    )
    return 1
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    const list = this.listStore.get(key) || []
    list.push(...values)
    this.listStore.set(key, list)
    return list.length
  }

  async lindex(key: string, index: number): Promise<string | null> {
    const list = this.listStore.get(key) || []
    return list[index] ?? null
  }

  async lset(key: string, index: number, value: string): Promise<'OK'> {
    const list = this.listStore.get(key) || []
    list[index] = value
    this.listStore.set(key, list)
    return 'OK'
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    const list = this.listStore.get(key) || []
    let removed = 0
    const newList = list.filter((item) => {
      if (item === value && (count === 0 || removed < Math.abs(count))) {
        removed++
        return false
      }
      return true
    })
    this.listStore.set(key, newList)
    return removed
  }

  async llen(key: string): Promise<number> {
    return (this.listStore.get(key) || []).length
  }

  // Pub/Sub methods (delegated to EventEmitter)
  async subscribe(...channels: string[]): Promise<number> {
    return channels.length
  }

  async unsubscribe(..._channels: string[]): Promise<number> {
    return 0
  }

  async publish(channel: string, message: string): Promise<number> {
    this.emit('message', channel, message)
    return 1
  }

  // Pipeline support (simplified)
  pipeline() {
    const commands: Array<{method: string; args: any[]}> = []
    const chain: any = new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          if (prop === 'exec') {
            return async () => {
              const results: any[] = []
              for (const cmd of commands) {
                try {
                  const result = await (this as any)[cmd.method](...cmd.args)
                  results.push([null, result])
                } catch (e) {
                  results.push([e, null])
                }
              }
              return results
            }
          }
          return (...args: any[]) => {
            commands.push({method: prop, args})
            return chain
          }
        }
      }
    )
    return chain
  }

  // Cleanup
  async quit(): Promise<'OK'> {
    this.cleanup()
    return 'OK'
  }

  async disconnect(): void {
    this.cleanup()
  }

  private cleanup() {
    for (const timeout of this.expiries.values()) {
      clearTimeout(timeout)
    }
    this.expiries.clear()
    this.store.clear()
    this.listStore.clear()
  }

  private clearExpiry(key: string) {
    const existing = this.expiries.get(key)
    if (existing) {
      clearTimeout(existing)
      this.expiries.delete(key)
    }
  }
}
