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
exports.login = exports.otpVerification = exports.productionValidation = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ProductionAdmin_1 = __importDefault(require("../../models/ProductionAdmin"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const productionValidation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productionName, email, password } = req.body;
    console.log(req.body);
    try {
        const existingProduction = yield ProductionAdmin_1.default.findOne({ productionName });
        const existingEmail = yield ProductionAdmin_1.default.findOne({ email });
        if (existingProduction) {
            return res.status(400).json({ success: false, message: "Name already exists!" });
        }
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        const generatedOTP = Math.floor(100000 + Math.random() * 900000);
        const hashedPass = bcryptjs_1.default.hashSync(password, 2);
        const newProduction = new ProductionAdmin_1.default({
            productionName,
            email,
            password: hashedPass,
            otpCode: generatedOTP
        });
        yield newProduction.save();
        console.log('Generated otp is ', generatedOTP);
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
            text: `Your OTP for verification of Producton unit registration of Scale.b is  : ${generatedOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.scale.b.online`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ success: false, message: "Error at sending mail" });
            }
            else {
                console.log('Email sent: ' + info.response);
                return res.status(250).json({ success: true, message: 'OTP send succesfully' });
            }
        });
    }
    catch (err) {
        console.log('error at Production signup', err);
        if (err.code === 11000) {
            const keyValue = err.keyValue;
            // console.log(err.keyValue);
            res.status(409).json({ success: false, message: `${keyValue} already exists` });
        }
    }
});
exports.productionValidation = productionValidation;
const otpVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, email } = req.body;
    const { otp } = data;
    try {
        const verifyEmail = yield ProductionAdmin_1.default.findOne({ email });
        const verifyOTP = (verifyEmail === null || verifyEmail === void 0 ? void 0 : verifyEmail.otpCode) == otp;
        if (!verifyEmail || !verifyOTP) {
            return res.status(401).json({ success: false, message: 'OTP entered is incorrect. Please try again.' });
        }
        if (verifyOTP) {
            const updated = yield ProductionAdmin_1.default.updateOne({ email }, { $set: { isVerified: true } });
            console.log(updated);
            return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
        }
    }
    catch (error) {
        console.error("Error at otp verification", error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
});
exports.otpVerification = otpVerification;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productionName, password } = req.body;
    try {
        const validUser = yield ProductionAdmin_1.default.findOne({ productionName });
        if (!validUser) {
            return res.status(401).json({ success: false, message: 'Enter valid credentials' });
        }
        const verifyPass = bcryptjs_1.default.compareSync(password, validUser.password);
        if (!verifyPass) {
            return res.status(401).json({ success: false, message: 'Password is wrong' });
        }
        validUser.password = '';
        const token = jsonwebtoken_1.default.sign({ id: validUser === null || validUser === void 0 ? void 0 : validUser._id.toString(), role: 'productionAdmin' }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        const expiry = new Date(Date.now() + 3600000);
        res.cookie('production_token', token, { httpOnly: true, expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'User validated' });
    }
    catch (error) {
        console.log('Error at productionAdmin login', error);
        res.status(500).json({ success: false, message: 'Internal server Error' });
    }
});
exports.login = login;
