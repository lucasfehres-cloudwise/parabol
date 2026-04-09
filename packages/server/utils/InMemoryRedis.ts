import {EventEmitter} from 'events'
import {Logger} from './Logger'

/** Shared backing stores so that duplicated instances share state and pub/sub. */
interface SharedState {
  store: Map<string, string>
  expiries: Map<string, NodeJS.Timeout>
  listStore: Map<string, string[]>
  /** Global message bus shared across duplicates */
  bus: EventEmitter
}

/**
 * In-memory Redis replacement for single-process deployments.
 * Implements the subset of the ioredis API used by Parabol.
 * Used when REDIS_URL is not configured.
 */
export default class InMemoryRedis extends EventEmitter {
  private store: Map<string, string>
  private expiries: Map<string, NodeJS.Timeout>
  private listStore: Map<string, string[]>
  /** Shared bus so publish/subscribe work across duplicates */
  private bus: EventEmitter
  private subscribedChannels = new Set<string>()
  status = 'ready'

  constructor(connectionNameOrShared?: string | SharedState) {
    super()
    if (typeof connectionNameOrShared === 'object') {
      // Duplicated instance – share backing stores & bus
      const shared = connectionNameOrShared
      this.store = shared.store
      this.expiries = shared.expiries
      this.listStore = shared.listStore
      this.bus = shared.bus
    } else {
      this.store = new Map()
      this.expiries = new Map()
      this.listStore = new Map()
      this.bus = new EventEmitter()
      this.bus.setMaxListeners(100)
      if (connectionNameOrShared) {
        Logger.log(`InMemoryRedis: created in-memory store for "${connectionNameOrShared}"`)
      }
    }
    // Emit ready event async to match ioredis behavior
    setTimeout(() => this.emit('ready'), 0)
  }

  /** Creates a new InMemoryRedis that shares the same underlying stores (ioredis compat). */
  duplicate(): InMemoryRedis {
    return new InMemoryRedis({
      store: this.store,
      expiries: this.expiries,
      listStore: this.listStore,
      bus: this.bus
    })
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null
  }

  async set(key: string, value: string, ...args: any[]): Promise<'OK' | string | null> {
    // Handle PX (millisecond TTL) and EX (second TTL), NX (only if not exists), GET (return old value)
    let ttlMs: number | undefined
    let nx = false
    let returnOld = false
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
      } else if (arg === 'GET') {
        returnOld = true
      }
    }
    const oldValue = this.store.get(key) ?? null
    if (nx && this.store.has(key)) {
      return returnOld ? oldValue : null
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
    return returnOld ? oldValue : 'OK'
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

  // Pub/Sub methods (use shared bus so duplicates can communicate)
  async subscribe(...channels: string[]): Promise<number> {
    for (const ch of channels) {
      if (!this.subscribedChannels.has(ch)) {
        this.subscribedChannels.add(ch)
        const handler = (message: Buffer) => {
          this.emit('message', ch, message.toString())
          this.emit('messageBuffer', Buffer.from(ch), message)
        }
        this.bus.on(`ch:${ch}`, handler)
      }
    }
    return this.subscribedChannels.size
  }

  async unsubscribe(...channels: string[]): Promise<number> {
    for (const ch of channels) {
      this.subscribedChannels.delete(ch)
      this.bus.removeAllListeners(`ch:${ch}`)
    }
    return this.subscribedChannels.size
  }

  async publish(channel: string, message: string | Buffer): Promise<number> {
    const buf = Buffer.isBuffer(message) ? message : Buffer.from(message)
    this.bus.emit(`ch:${channel}`, buf)
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

  async disconnect(): Promise<void> {
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
