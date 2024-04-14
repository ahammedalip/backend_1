"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retailerAdmin = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    retailerName: {
        type: String,
        required: true,
        // unique: true
    },
    email: {
        type: String,
        required: true,
        // unique: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'retailer'
    },
    otpCode: {
        type: Number,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String
    },
    connectedProduction: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'ProductionAdmin'
        }],
    requestedProduction: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'ProductionAdmin'
        }],
    recievedProduction: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'ProductionAdmin'
        }],
    subscribed: {
        endDate: {
            type: Date,
        },
        active: {
            type: Boolean,
        },
        duration: {
            type: String,
        }
    }
});
exports.retailerAdmin = (0, mongoose_1.model)('RetailerAdmin', userSchema);
// export default retailerAdmin; 
