"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutOne = exports.createCheckout = void 0;
const SubscriptionPlans_1 = require("../models/SubscriptionPlans");
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
const createCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('querryry', req.body);
    try {
        const fetchPlan = yield SubscriptionPlans_1.subscriptionPlans.findById(req.body.planId);
        const planAmount = parseInt((fetchPlan === null || fetchPlan === void 0 ? void 0 : fetchPlan.amount) || '0', 10) * 100;
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = yield stripe.checkout.sessions.create({
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
    }
    catch (error) {
        console.log('erorr while stripe payment', error);
        res.status(500);
    }
});
exports.createCheckout = createCheckout;
const createCheckoutOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('herer---', req.body);
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = yield stripe.checkout.sessions.create({
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
});
exports.createCheckoutOne = createCheckoutOne;
