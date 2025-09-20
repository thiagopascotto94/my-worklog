// IMPORTANT: The migration to add the subscriptionStatus and stripeCustomerId fields to the User model must be run before this service can be used.
// You can run the migration by running the following command in the backend directory: npx sequelize-cli db:migrate

const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../models');

/**
 * Creates a new customer in Stripe.
 * @param {string} email - The customer's email address.
 * @param {string} name - The customer's name.
 * @returns {Promise<Stripe.Customer>} The created customer object.
 */
const createCustomer = async (email, name) => {
  try {
    const customer = await Stripe.customers.create({
      email,
      name,
    });
    const user = await User.findOne({ where: { email } });
    if (user) {
      user.stripeCustomerId = customer.id;
      await user.save();
    }
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

/**
 * Creates a new subscription for a customer.
 * @param {string} customerId - The ID of the Stripe customer.
 * @param {string} priceId - The ID of the price to subscribe to.
 * @returns {Promise<Stripe.Subscription>} The created subscription object.
 */
const createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await Stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
};

/**
 * Handles incoming webhooks from Stripe.
 * @param {object} event - The Stripe webhook event.
 */
const handleWebhook = async (event) => {
  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      try {
        const user = await User.findOne({ where: { stripeCustomerId: invoice.customer } });
        if (user) {
          user.subscriptionStatus = 'active';
          await user.save();
        }
      } catch (error) {
        console.error('Error handling invoice.payment_succeeded webhook:', error);
      }
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      try {
        const user = await User.findOne({ where: { stripeCustomerId: failedInvoice.customer } });
        if (user) {
          user.subscriptionStatus = 'payment_failed';
          await user.save();
        }
      } catch (error) {
        console.error('Error handling invoice.payment_failed webhook:', error);
      }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

module.exports = {
  createCustomer,
  createSubscription,
  handleWebhook,
};
