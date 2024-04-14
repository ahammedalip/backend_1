import { Request, Response } from 'express'
// import retailerAdmin from '../models/RetailerAdmin';
// import productionAdmin from '../models/ProductionAdmin';

export const createCheckout = async (req: Request, res: Response) => {
    console.log('querryry', req.body);
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: 'price_1OzDT8SE5kKjTaV2qGPLe9YF',
                quantity: 1,

            },
        ],

        currency: "usd",
        mode: 'subscription',
        success_url: `http://localhost:5173/success?time=six`,
        cancel_url: `http://localhost:5173/failed`,
    });

    // Return the session ID to the client
    res.json({ id: session.id });
}

export const createCheckoutOne = async (req: Request, res: Response) => {
    console.log('herer---', req.body)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: 'price_1OzDUOSE5kKjTaV2o8KPhzfo',
                quantity: 1,
            },
        ],

        currency: "usd",
        mode: 'subscription',
        success_url: `http://localhost:5173/success?time=one`,
        cancel_url: `http://localhost:5173/failed`,
    });

    // Return the session ID to the client
    res.json({ id: session.id });
}
