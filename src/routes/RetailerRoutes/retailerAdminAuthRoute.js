"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const retailerAuth_1 = require("../../controllers/RetailerController/retailerAuth");
const router = express_1.default.Router();
router.post('/verify_cred', retailerAuth_1.retailValidation);
router.post('/resend-otp', retailerAuth_1.resendOTP);
router.post('/verify_otp', retailerAuth_1.otpVerification);
router.post('/login', retailerAuth_1.retailLogin);
exports.default = router;
