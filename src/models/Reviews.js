"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReviewSchema = new mongoose_1.default.Schema({
    reviewer: {
        type: {
            type: String,
            enum: ['retailer', 'productionUnit'],
            required: true
        },
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true
        }
    },
    reviewee: {
        type: {
            type: String,
            enum: ['retailer', 'productionUnit'],
            required: true
        },
        id: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            required: true
        }
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    review: {
        type: String,
    },
}, { timestamps: true });
const reviews = mongoose_1.default.model('Review', ReviewSchema);
exports.default = reviews;
