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
// import retailerAdmin from '../models/RetailerAdmin';
// import productionAdmin from '../models/ProductionAdmin';
const createCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('querryry', req.body);
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = yield stripe.checkout.sessions.create({
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
