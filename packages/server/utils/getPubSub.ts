import GraphQLRedisPubSub from './GraphQLRedisPubSub'
import InMemoryPubSub from './InMemoryPubSub'
import RedisInstance from './RedisInstance'

let pubsub: GraphQLRedisPubSub | InMemoryPubSub
const getPubSub = () => {
  if (!pubsub) {
    if (process.env.REDIS_URL) {
      const pub = new RedisInstance('getPubSub_pub')
      const sub = new RedisInstance('getPubSub_sub')
      pubsub = new GraphQLRedisPubSub(pub, sub)
    } else {
      pubsub = new InMemoryPubSub()
    }
  }
  return pubsub
}
export default getPubSub
