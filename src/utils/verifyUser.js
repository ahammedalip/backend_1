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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySender = exports.verifyProduction = exports.verifyAdmin = exports.verifySales = exports.verifyRetailer = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ProductionAdmin_1 = __importDefault(require("../models/ProductionAdmin"));
const RetailerAdmin_1 = require("../models/RetailerAdmin");
const verifyRetailer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('coming here to verify retailer admin');
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // If no token, return  401 Unauthorized
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        const verifyUser = yield RetailerAdmin_1.retailerAdmin.findById(decoded.id);
        // console.log('decoded token from retailer is->', decoded);
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.role) !== 'retailerAdmin') {
            res.status(401).json({ success: false, message: 'Unauthorized user' });
        }
        if (verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.isBlocked) {
            console.log('user is blocked');
            return res.status(403).json({ success: false, message: "User blocked " });
        }
        req.role = decoded.role;
        req.id = decoded.id;
        next();
    }
    catch (err) {
        console.error(err);
        return res.sendStatus(403); // Forbidden
    }
});
exports.verifyRetailer = verifyRetailer;
const verifySales = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // If no token, return  401 Unauthorized
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        const verifyUser = yield RetailerAdmin_1.retailerAdmin.findById(decoded.id);
        // console.log('decoded token from retailer is->', decoded);
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.role) !== 'retailerSales') {
            res.status(401).json({ success: false, message: 'Unauthorized user' });
        }
        if (verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.isBlocked) {
            console.log('user is blocked');
            return res.status(403).json({ success: false, message: "User blocked " });
        }
        req.role = decoded.role;
        req.id = decoded.id;
        next();
    }
    catch (err) {
        console.error(err);
        return res.sendStatus(403); // Forbidden
    }
});
exports.verifySales = verifySales;
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // If no token, return  401 Unauthorized
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        // console.log('decoded token from verify admin', decoded); // This will log the decoded payload to the console
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.role) !== 'SuperAdmin') {
            res.status(401).json({ success: false, message: 'Unauthorized user' });
        }
        return next();
    }
    catch (err) {
        // Handle the error if the token is not valid
        console.error(err);
        return res.sendStatus(403); // Forbidden
    }
});
exports.verifyAdmin = verifyAdmin;
const verifyProduction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // If no token, return  401 Unauthorized
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        // console.log('decoded token from verify admin', decoded); // This will log the decoded payload to the console
        const verifyUser = yield ProductionAdmin_1.default.findById(decoded.id);
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.role) !== 'productionAdmin' || !verifyUser) {
            return res.status(401).json({ success: false, message: 'Unauthorized user' });
        }
        if (verifyUser.isBlocked) {
            console.log('user is blocked');
            return res.status(403).json({ success: false, message: "User blocked " });
        }
        req.role = decoded.role;
        req.id = decoded.id;
        return next();
    }
    catch (err) {
        // Handle the error if the token is not valid
        console.error(err);
        return res.sendStatus(403); // Forbidden
    }
});
exports.verifyProduction = verifyProduction;
const verifySender = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401); // If no token, return  401 Unauthorized
    }
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        // console.log('decoded token from verify admin', decoded); // This will log the decoded payload to the console
        const verifyUser = yield ProductionAdmin_1.default.findById(decoded.id);
        if (verifyUser === null || verifyUser === void 0 ? void 0 : verifyUser.isBlocked) {
            console.log('user is blocked');
            return res.status(403).json({ success: false, message: "User blocked " });
        }
        req.role = decoded.role;
        req.id = decoded.id;
        return next();
    }
    catch (err) {
        console.error(err);
        return res.sendStatus(403); // Forbidden
    }
});
exports.verifySender = verifySender;
