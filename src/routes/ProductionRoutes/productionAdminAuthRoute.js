"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AdminAuth_1 = require("../../controllers/ProductionController/AdminAuth");
const router = express_1.default.Router();
router.post('/verify_cred', AdminAuth_1.productionValidation);
router.post('/verify_otp', AdminAuth_1.otpVerification);
router.post('/login', AdminAuth_1.login);
exports.default = router;
