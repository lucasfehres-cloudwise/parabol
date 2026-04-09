import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'

async function teardown() {
  await getKysely().destroy()
  console.log('global teardown destroy')
  const redis = getRedis()
  if (typeof redis.quit === 'function') {
    await redis.quit()
  }
}

export default teardown
