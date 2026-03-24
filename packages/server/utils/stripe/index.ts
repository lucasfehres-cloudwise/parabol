import StripeManager from './StripeManager'
import StubStripeManager from './StubStripeManager'
import createNoOpStripeManager from './NoOpStripeManager'

const isBillingEnabled = process.env.BILLING_ENABLED === 'true'

export function getStripeManager(): StripeManager {
  if (!isBillingEnabled) return createNoOpStripeManager()
  return process.env.CI ? StubStripeManager() : new StripeManager()
}
