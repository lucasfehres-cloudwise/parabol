import type Stripe from 'stripe'
import {Logger} from '../Logger'
import type StripeManager from './StripeManager'

/**
 * A no-op StripeManager that does not require the Stripe SDK or any API keys.
 * Used when BILLING_ENABLED is not set to 'true', allowing the app to run
 * without any payment infrastructure.
 */
class NoOpStripeManagerImpl {
  constructEvent(_rawBody: string, _signature: string) {
    Logger.log('NoOpStripeManager: constructEvent called, billing is disabled')
    return null
  }

  async attachPaymentToCustomer(_customerId: string, _paymentMethodId: string) {
    return new Error('Billing is disabled') as Error
  }

  async updateSubscription(_subscriptionId: string, _paymentMethodId: string) {
    return new Error('Billing is disabled') as Error
  }

  async retrieveCardDetails(_paymentMethodId: string) {
    return new Error('Billing is disabled') as Error
  }

  async retrieveDefaultCardDetails(_customerId: string) {
    return new Error('Billing is disabled') as Error
  }

  async createCustomer(_orgId: string, _email: string, _paymentMethodId?: string, _source?: string) {
    return {id: 'noop-customer-id'} as unknown as Stripe.Customer
  }

  async createEnterpriseSubscription(_customerId: string, _orgId: string, _quantity: number, _plan?: string) {
    return {
      id: 'noop-subscription-id',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
    } as unknown as Stripe.Subscription
  }

  async createTeamSubscription(
    _customerId: string,
    _quantity: number,
    _metadata: {orgId: string; userId: string},
    _couponId?: string
  ) {
    return {
      id: 'noop-subscription-id',
      latest_invoice: {
        payment_intent: {
          client_secret: 'noop-client-secret'
        }
      }
    } as unknown as Stripe.Subscription
  }

  async deleteSubscription(_stripeSubscriptionId: string) {
    return {} as unknown as Stripe.Subscription
  }

  async getCustomersByEmail(_email: string) {
    return {data: []} as unknown as Stripe.ApiList<Stripe.Customer>
  }

  async listInvoices(_stripeId: string, _startingAfter?: string) {
    return {data: []} as unknown as Stripe.ApiList<Stripe.Invoice>
  }

  async getSubscriptionItem(_subscriptionId: string) {
    return undefined
  }

  async listSubscriptionOpenInvoices(_subscriptionId: string) {
    return {data: []} as unknown as Stripe.ApiList<Stripe.Invoice>
  }

  async payInvoice(_invoiceId: string) {
    return {} as unknown as Stripe.Invoice
  }

  async listLineItems(_invoiceId: string, _options: any) {
    return {data: []} as unknown as Stripe.ApiList<Stripe.InvoiceLineItem>
  }

  async listSources(_customerId: string) {
    return {data: []} as unknown as Stripe.ApiList<Stripe.CustomerSource>
  }

  async listActiveSubscriptions(_customerId: string) {
    return {data: []} as unknown as Stripe.ApiList<Stripe.Subscription>
  }

  async retrieveCharge(_chargeId: string) {
    return {} as unknown as Stripe.Charge
  }

  async retrieveCoupon(_couponId: string) {
    return new Error('Billing is disabled') as Error
  }

  async retrieveCustomer(_customerId: string) {
    return {} as unknown as Stripe.Customer | Stripe.DeletedCustomer
  }

  async retrieveInvoice(_invoiceId: string) {
    return {} as unknown as Stripe.Invoice
  }

  async retrieveInvoiceItem(_invoiceItemId: string) {
    return {} as unknown as Stripe.InvoiceItem
  }

  async retrieveSource(_customerId: string, _cardId: string) {
    return {} as unknown as Stripe.CustomerSource
  }

  async retrieveSubscription(_subscriptionId: string) {
    return {} as unknown as Stripe.Subscription
  }

  async retrieveUpcomingInvoice(_stripeId: string) {
    return {} as unknown as Stripe.Invoice
  }

  async updateAccountBalance(_customerId: string, _newBalance: number) {
    return {} as unknown as Stripe.Customer
  }

  async updateInvoice(_invoiceId: string, _orgId: string) {
    return {} as unknown as Stripe.Invoice
  }

  async updateInvoiceItem(_invoiceItemId: string, _type: any, _userId: string, _hookId: string) {
    return {} as unknown as Stripe.InvoiceItem
  }

  async updatePayment(_customerId: string, _source: string) {
    return {} as unknown as Stripe.Customer
  }

  async updateDefaultPaymentMethod(_customerId: string, _paymentMethodId: string) {
    return {} as unknown as Stripe.Customer
  }

  async updateSubscriptionItemQuantity(_stripeSubscriptionItemId: string, _quantity: number) {
    return {} as unknown as Stripe.SubscriptionItem
  }
}

export default function createNoOpStripeManager(): StripeManager {
  return new NoOpStripeManagerImpl() as unknown as StripeManager
}
