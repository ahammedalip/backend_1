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
exports.retailLogin = exports.otpVerification = exports.retailValidation = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RetailerSales_1 = __importDefault(require("../../models/RetailerSales"));
const RetailerAdmin_1 = require("../../models/RetailerAdmin");
const retailValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { retailerName, email, password, } = req.body;
    console.log(req.body);
    try {
        const existingRetailer = yield RetailerAdmin_1.retailerAdmin.findOne({ retailerName });
        const existingEmail = yield RetailerAdmin_1.retailerAdmin.findOne({ email });
        if (existingRetailer) {
            res.status(400).json({ success: false, message: 'Retailer name already exists' });
        }
        if (existingEmail) {
            res.status(400).json({ success: false, message: 'Email already exists' });
        }
        const generatedOTP = Math.floor(100000 + Math.random() * 900000);
        const hashedPass = bcryptjs_1.default.hashSync(password, 2);
        const newRetailer = new RetailerAdmin_1.retailerAdmin({
            retailerName,
            email,
            password: hashedPass,
            otpCode: generatedOTP
        });
        yield newRetailer.save();
        console.log('generated OTP is ', generatedOTP);
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ahmd.work12@gmail.com',
                pass: 'awbs lrfg gwgv zqvg'
            }
        });
        const mailOptions = {
            from: 'ahmd.work12@gmail.com',
            to: req.body.email, // User's email
            subject: 'OTP Verification',
            text: `Your OTP for verification of Scale.b is  : ${generatedOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.scale.b.online`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).json({ success: false, message: "Error at sending mail" });
            }
            else {
                console.log('Email sent: ' + info.response);
                res.status(250).json({ success: true, message: 'OTP send succesfully' });
            }
        });
    }
    catch (err) {
        console.log('error at retailer signup', err);
        if (err.code === 11000) {
            const keyValue = err.keyValue;
            // console.log(err.keyValue);
            res.status(409).json({ success: false, message: `${keyValue} already exists` });
        }
    }
});
exports.retailValidation = retailValidation;
const otpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { formData, otp } = req.body;
    const { retailerName, email, password } = formData;
    try {
        const verifyEmail = yield RetailerAdmin_1.retailerAdmin.findOne({ email: email });
        const verifyOTP = (verifyEmail === null || verifyEmail === void 0 ? void 0 : verifyEmail.otpCode) == otp;
        if (!verifyOTP || !verifyEmail) {
            res.status(401).json({ success: false, message: 'OTP entered is incorrect. Please try again.' });
        }
        if (verifyOTP) {
            const updated = yield RetailerAdmin_1.retailerAdmin.updateOne({ email }, { $set: { isVerified: true } });
            return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
        }
    }
    catch (error) {
        console.error("Error at otp verification", error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});
exports.otpVerification = otpVerification;
const retailLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { retailerName, password, role } = req.body;
    console.log(req.body);
    console.log('coming here');
    if (role == 'retailAdmin') {
        try {
            const validUser = yield RetailerAdmin_1.retailerAdmin.findOne({ retailerName });
            if (!validUser) {
                return res.status(401).json({ success: false, message: 'Enter valid credentials' });
            }
            const hashedPass = bcryptjs_1.default.compareSync(password, validUser === null || validUser === void 0 ? void 0 : validUser.password);
            if (!hashedPass) {
                return res.status(401).json({ success: false, message: 'Password is wrong' });
            }
            if (validUser.isBlocked) {
                return res.status(403).json({ success: false, message: 'User is Blocked' });
            }
            if (!validUser.isVerified) {
                return res.status(403).json({ success: false, message: 'Please Signup again' });
            }
            validUser.password = "";
            const token = jsonwebtoken_1.default.sign({ id: validUser === null || validUser === void 0 ? void 0 : validUser._id.toString(), role: 'retailerAdmin', validUser: validUser.retailerName }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
            const expiry = new Date(Date.now() + 3600000);
            res.cookie('retailer_token', token, { httpOnly: true, expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'User validated' });
        }
        catch (error) {
            console.log('Error at retailAdmin login', error);
            return res.status(500).json({ success: false, message: 'Internal server Error' });
        }
    }
    else if (role == 'salesExecutive') {
        try {
            const validUser = yield RetailerSales_1.default.findOne({ username: retailerName });
            // console.log('alid user', validUser);
            if (!validUser) {
                return res.status(401).json({ success: false, message: 'Enter valid credentials' });
            }
            const hashedPass = bcryptjs_1.default.compareSync(password, validUser.password);
            if (!hashedPass) {
                return res.status(401).json({ success: false, message: 'Password is wrong' });
            }
            if (validUser.isBlocked) {
                return res.status(403).json({ success: false, message: 'User is Blocked' });
            }
            validUser.password = "";
            const token = jsonwebtoken_1.default.sign({ id: validUser === null || validUser === void 0 ? void 0 : validUser._id.toString(), role: 'retailerSales', validUser: validUser.username }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
            const expiry = new Date(Date.now() + 3600000);
            res.cookie('retailerSales_token', token, { httpOnly: true, expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'User validated' });
        }
        catch (error) {
            console.log('Error at retailAdmin login', error);
            return res.status(500).json({ success: false, message: 'Internal server Error' });
        }
    }
});
exports.retailLogin = retailLogin;
