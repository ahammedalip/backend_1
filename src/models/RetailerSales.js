"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    retailerAdminId: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'retailer_sales'
    }
});
const retailerSales = (0, mongoose_1.model)('RetailerSales', userSchema);
exports.default = retailerSales;
