import { Request, Response } from 'express';
import { subscriptionPlans } from '../models/SubscriptionPlans';

// import retailerAdmin from '../models/RetailerAdmin';
// import productionAdmin from '../models/ProductionAdmin';

// export const createCheckout = async (req: Request, res: Response) => {
//     console.log('querryry', req.body);
//     const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: [
//             {
//                 // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
//                 price: 'price_1OzDT8SE5kKjTaV2qGPLe9YF',
//                 quantity: 1,

//             },
//         ],

//         currency: "usd",
//         mode: 'subscription',
//         success_url: `https://scaleb.vercel.app/success?time=six`,
//         cancel_url: `https://scaleb.vercel.app/failed`,
//     });

//     // Return the session ID to the client
//     res.json({ id: session.id });
// }


export const createCheckout = async (req: Request, res: Response) => {
    console.log('querryry', req.body);

    try {
        const fetchPlan = await subscriptionPlans.findById(req.body.planId)
        const planAmount = parseInt(fetchPlan?.amount || '0', 10) * 100;

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Your Product Name',
                        },
                        recurring: {
                            interval: 'month', // or 'year' for yearly subscription
                        },
                        unit_amount: planAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `https://scaleb.vercel.app/success?planId=${req.body.planId}`,
            cancel_url: `https://scaleb.vercel.app/failed`,
        });
        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],
        //     line_items: [
        //         {
        //             // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        //             price: 'price_1OzDT8SE5kKjTaV2qGPLe9YF',
        //             quantity: 1,
    
        //         },
        //     ],
    
        //     currency: "usd",
        //     mode: 'subscription',
        //     success_url: `http://localhost:5173/success?time=six`,
        //     cancel_url: `http://localhost:5173/failed`,
        // });

        // Return the session ID to the client
        res.json({ id: session.id });
    } catch (error) {
        console.log('erorr while stripe payment', error);
        res.status(500)
    }
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
