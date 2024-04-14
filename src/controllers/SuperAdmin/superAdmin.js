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
exports.getReport = exports.miniReport = exports.getRevenue = exports.blockUser = exports.getProductionList = exports.getRetailerList = exports.login = void 0;
const errorhandler_1 = require("../../utils/errorhandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ProductionAdmin_1 = __importDefault(require("../../models/ProductionAdmin"));
const Payments_1 = __importDefault(require("../../models/Payments"));
const SuperAdmin_1 = require("../../models/SuperAdmin");
const RetailerAdmin_1 = require("../../models/RetailerAdmin");
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password: reqPassword } = req.body;
    try {
        const validUser = yield SuperAdmin_1.superAdmin.findOne({ username });
        console.log('user found', validUser);
        if (!validUser) {
            // If user is not found, call the error handler and pass the error to next
            const error = (0, errorhandler_1.errorhandler)(401, "User not found");
            return res.status(error.StatusCode).json({ success: false, message: error.message });
        }
        if (validUser && validUser.password && validUser.password !== reqPassword) {
            const error = (0, errorhandler_1.errorhandler)(401, "Wrong credentials");
            return res.status(error.StatusCode).json({ success: false, message: error.message });
        }
        validUser.password = "";
        const token = jsonwebtoken_1.default.sign({ id: validUser._id.toString(), role: 'SuperAdmin' }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        const expiry = new Date(Date.now() + 3600000);
        res.cookie('admin_token', token, { expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'user validated' });
    }
    catch (err) {
        console.log('Error at superAdmin signup', err);
        const error = (0, errorhandler_1.errorhandler)(500, "Internal Server Error");
        res.status(error.StatusCode).json({ success: false, message: error.message });
    }
});
exports.login = login;
const getRetailerList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pageSize = 10;
    try {
        const { page = 1 } = req.query;
        const countRetailList = yield RetailerAdmin_1.retailerAdmin.countDocuments({ isVerified: true });
        const totalPages = Math.ceil(countRetailList / pageSize);
        const retailersList = yield RetailerAdmin_1.retailerAdmin.find({ isVerified: true })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize));
        res.status(200).json({ success: true, message: 'Retailer list fetched successfully', userlist: retailersList, countRetailList, totalPages });
    }
    catch (error) {
        console.log('error at fetching retailer list', error);
        res.status(500).json({ success: false, message: 'Error at fetching retailer list' });
    }
});
exports.getRetailerList = getRetailerList;
const getProductionList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pageSize = 10;
    try {
        const { page = 1 } = req.query;
        const countProductionList = yield ProductionAdmin_1.default.countDocuments({ isVerified: true });
        const totalPages = Math.ceil(countProductionList / pageSize);
        const productionList = yield ProductionAdmin_1.default.find({ isVerified: true })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize));
        res.status(200).json({ success: true, message: 'Production list fetched successfully', userlist: productionList, countProductionList, totalPages, });
    }
    catch (error) {
        console.log('Error at fetching production list=>', error);
        res.status(500).json({ success: false, message: 'Error at fetching production list' });
    }
});
exports.getProductionList = getProductionList;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, id } = req.query;
    console.log(role, id);
    console.log('cp,omm');
    if (role == 'production') {
        try {
            const validUser = yield ProductionAdmin_1.default.findById(id);
            if (!validUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            const isBlocked = validUser.isBlocked;
            const updateStatus = yield ProductionAdmin_1.default.updateOne({ _id: id }, { $set: { isBlocked: !isBlocked } });
            if (!updateStatus) {
                return res.status(500).json({ success: false, message: 'Error while blocking' });
            }
            const productionList = yield ProductionAdmin_1.default.find({ isVerified: true });
            return res.status(200).json({ success: true, message: 'User blocked successfully', userlist: productionList });
        }
        catch (error) {
            console.log('error at block production or retailer user -->', error);
            res.status(500).json({ success: true, message: 'Error at Blocking user' });
        }
    }
    else if (role == 'retailer') {
        try {
            const validUser = yield RetailerAdmin_1.retailerAdmin.findById(id);
            if (!validUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            const isBlocked = validUser.isBlocked;
            const updateStatus = yield RetailerAdmin_1.retailerAdmin.updateOne({ _id: id }, { $set: { isBlocked: !isBlocked } });
            if (!updateStatus) {
                return res.status(500).json({ success: false, message: 'Error while blocking' });
            }
            const productionList = yield RetailerAdmin_1.retailerAdmin.find({ isVerified: true });
            return res.status(200).json({ success: true, message: 'User blocked successfully', userlist: productionList });
        }
        catch (error) {
            console.log('error at block production or retailer user -->', error);
            res.status(500).json({ success: true, message: 'Error at Blocking user' });
        }
    }
});
exports.blockUser = blockUser;
const getRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pageSize = 10;
    try {
        const { page = 1 } = req.query;
        const totalPaymentDoc = yield Payments_1.default.countDocuments();
        const totalPages = Math.ceil(totalPaymentDoc / pageSize);
        const getRevenue = yield Payments_1.default.find()
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .populate('userId');
        // console.log('get revenue', getRevenue)
        const totalPayment = yield Payments_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        const totalAmount = totalPayment[0].totalAmount;
        // console.log('total amount', totalPayment[0].totalAmount)
        res.status(200).json({ success: true, revenueList: getRevenue, totalAmount, totalPaymentDoc, totalPages });
    }
    catch (error) {
        console.log('error at get revenue', error);
        res.status(500);
    }
});
exports.getRevenue = getRevenue;
const miniReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const countRetailer = yield RetailerAdmin_1.retailerAdmin.countDocuments({
            isBlocked: false,
            isVerified: true
        });
        const countProduction = yield ProductionAdmin_1.default.countDocuments({
            isBlocked: false,
            isVerified: true,
        });
        const totalPayment = yield Payments_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        const totalAmount = totalPayment[0].totalAmount;
        res.status(200).json({ success: true, countRetailer, countProduction, totalAmount });
    }
    catch (error) {
        console.log('error while fetching miniReport', error);
        res.status(500);
    }
});
exports.miniReport = miniReport;
const getReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentYear = new Date().getFullYear();
        // Query MongoDB to fetch the revenue data for each month of the current year
        const revenueData = yield Payments_1.default.aggregate([
            {
                $match: {
                    // Match payments for the current year
                    createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
                }
            },
            {
                $project: {
                    month: { $month: '$createdAt' }, // Extract the month from the createdAt field
                    amount: '$amount' // Keep the amount field
                }
            },
            {
                $group: {
                    _id: '$month', // Group payments by month
                    totalPayment: { $sum: '$amount' } // Calculate the total payment amount for each month
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id field from the result
                    month: '$_id', // Rename _id to month
                    totalPayment: 1 // Include totalPayment field
                }
            },
            {
                $sort: { month: 1 } // Sort the results by month
            }
        ]);
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        // Replace numeric month values with month names
        const formattedRevenueData = revenueData.map(item => (Object.assign(Object.assign({}, item), { month: monthNames[item.month] })));
        console.log(formattedRevenueData);
        res.status(200).json({ success: true, revenueData });
    }
    catch (error) {
        console.log('error while getting report >>', error);
        res.status(500);
    }
});
exports.getReport = getReport;
