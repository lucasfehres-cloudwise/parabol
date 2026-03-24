import SubscriptionIterator, {type SubscriptionListener} from './SubscriptionIterator'

interface ListenersByChannel {
  [channel: string]: SubscriptionListener[]
}

/**
 * In-memory GraphQL PubSub for single-process deployments.
 * Replaces GraphQLRedisPubSub when Redis is not available.
 */
export default class InMemoryPubSub {
  listenersByChannel: ListenersByChannel = {}

  publish = (_channel: string, payload: any) => {
    const listeners = this.listenersByChannel[_channel]
    if (!listeners) return Promise.resolve(0)
    listeners.forEach((listener) => {
      listener(payload)
    })
    return Promise.resolve(listeners.length)
  }

  subscribe = async (channels: string[], onCompleted?: () => void) => {
    const onStart = (listener: SubscriptionListener) => {
      channels.forEach((channel) => {
        this.listenersByChannel[channel] = this.listenersByChannel[channel] || []
        this.listenersByChannel[channel]!.push(listener)
      })
    }
    const onCompletedHandler = (listener: SubscriptionListener) => {
      onCompleted?.()
      this.unsubscribe(channels, listener)
    }
    return new SubscriptionIterator({onStart, onCompleted: onCompletedHandler})
  }

  unsubscribe = (channels: string[], listener: SubscriptionListener) => {
    channels.forEach((channel) => {
      const listeners = this.listenersByChannel[channel]
      if (!listeners) return
      const listenerIdx = listeners.indexOf(listener)
      if (listenerIdx === -1) return
      if (listeners.length === 1) {
        delete this.listenersByChannel[channel]
      } else {
        listeners.splice(listenerIdx, 1)
      }
    })
  }

  destroy() {
    this.listenersByChannel = {}
  }
}
