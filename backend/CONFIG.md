# Configuration

To use the payment gateway, you need to configure the following environment variables. You can create a `.env.local` file in the `backend` directory and add the following variables:

## Stripe

- `STRIPE_SECRET_KEY`: Your Stripe secret key. You can find this in your Stripe dashboard.

Example `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_...
```
