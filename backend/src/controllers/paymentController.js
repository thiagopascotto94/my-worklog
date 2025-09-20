const paymentService = require('../services/paymentService');

const createCustomer = async (req, res) => {
  const { email, name } = req.body;
  try {
    const customer = await paymentService.createCustomer(email, name);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

const createSubscription = async (req, res) => {
  const { customerId, priceId } = req.body;
  try {
    const subscription = await paymentService.createSubscription(customerId, priceId);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

const handleWebhook = (req, res) => {
  const event = req.body;
  paymentService.handleWebhook(event);
  res.status(200).send();
};

module.exports = {
  createCustomer,
  createSubscription,
  handleWebhook,
};
