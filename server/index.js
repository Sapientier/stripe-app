const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

require('dotenv').config();

const app = express();
const stripe = new Stripe(process.env.SE_SK);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/api/checkout', async (req, res) => {
    try {
        const { id, amount } = req.body;

        const payment = await stripe.paymentIntents.create({
            amount,
            currency: "USD",
            description: "Exotic animal",
            payment_method: id,
            confirm: true
        })

        const customer = await stripe.customers.create({
            description: 'My First Test Customer (created for API docs)',
            payment_method: id,
        });

        console.log(customer);
        console.log(payment);

        if (payment.status === 'succeeded') {
            res.send({ message: 'Successful Payment', client_secret: payment.client_secret });
        }
        else {
            res.send({ message: payment.status });
        }
    } catch (error) {
        res.json({ message: error.raw.message });
    }
});

app.listen(3001, () => {
    console.log('Server on port', 3001);
});