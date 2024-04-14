"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeController_1 = require("../../controllers/stripeController");
const router = express_1.default.Router();
router.post('/create-checkout-session-six', stripeController_1.createCheckout);
router.post('/create-checkout-session-one', stripeController_1.createCheckoutOne);
exports.default = router;
