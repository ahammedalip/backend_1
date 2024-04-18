"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionPlans = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    amount: {
        type: String
    },
    features: {
        type: String,
    },
    duration: {
        type: String,
    },
    role: {
        type: String
    },
    active: {
        type: Boolean,
        default: true,
    },
});
exports.subscriptionPlans = (0, mongoose_1.model)('subPlans', subscriptionSchema);
