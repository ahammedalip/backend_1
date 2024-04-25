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
exports.editDescription = exports.fetchRetailPlans = exports.getReport = exports.addSubscription = exports.getOrder = exports.sendConnectionRequest = exports.showProductionprofile = exports.avialableProd = exports.connectedProd = exports.profile = exports.blockSalesExec = exports.getSalesList = exports.addSalesExecutive = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const RetailerSales_1 = __importDefault(require("../../models/RetailerSales"));
const ProductionAdmin_1 = __importDefault(require("../../models/ProductionAdmin"));
const Order_1 = __importDefault(require("../../models/Order"));
const Reviews_1 = __importDefault(require("../../models/Reviews"));
const node_cron_1 = __importDefault(require("node-cron"));
const Payments_1 = __importDefault(require("../../models/Payments"));
const RetailerAdmin_1 = require("../../models/RetailerAdmin");
const SubscriptionPlans_1 = require("../../models/SubscriptionPlans");
// Schedule a job to run every day at 12 pm
node_cron_1.default.schedule('0 12 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    yield RetailerAdmin_1.retailerAdmin.updateMany({ 'subscribed.endDate': { $lt: currentDate } }, { $set: { 'subscribed.$.active': false } });
    console.log('Subscription status updated.');
}));
const addSalesExecutive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, id } = req.body;
    const { username, password, email } = data;
    try {
        const validAdmin = yield RetailerAdmin_1.retailerAdmin.findById(id);
        if ((validAdmin === null || validAdmin === void 0 ? void 0 : validAdmin.isBlocked) || !(validAdmin === null || validAdmin === void 0 ? void 0 : validAdmin.isVerified)) {
            return res.status(403).json({ success: false, message: 'Please login again' });
        }
        const modUsername = username + '@' + validAdmin.retailerName;
        const existingUsername = yield RetailerSales_1.default.findOne({ username });
        const existingEmail = yield RetailerSales_1.default.findOne({ email });
        if (existingEmail || existingUsername) {
            return res.status(409).json({ success: false, message: "Email or username already exists" });
        }
        console.log(modUsername);
        const hashedPass = bcryptjs_1.default.hashSync(password, 2);
        const newSalesExec = new RetailerSales_1.default({
            username: modUsername,
            email,
            password: hashedPass,
            retailerAdminId: id
        });
        newSalesExec.save();
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ahmd.work12@gmail.com',
                pass: 'awbs lrfg gwgv zqvg'
            }
        });
        const mailOptions = {
            from: 'ahmd.work12@gmail.com',
            to: email, // User's email
            subject: 'Username and password',
            text: `Congratulations You are registered!!!.
        please use the below given Username and Password for logging into scale.b
        Username: ${modUsername},
        Password: ${password}.
        
        For logging in please visit http://localhost:5173/retail/login`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ success: false, message: "Error at sending mail" });
            }
            else {
                console.log('Email sent: ' + info.response);
                res.status(250).json({ success: true, message: 'User registered and email sent successfully' });
            }
        });
    }
    catch (error) {
        console.log('error at addSalesExecutive', error);
        res.status(500).json({ success: false, message: "Error while adding sales executive" });
    }
});
exports.addSalesExecutive = addSalesExecutive;
const getSalesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const pageSize = 10;
    try {
        const { page = 1 } = req.query;
        const countSales = yield RetailerSales_1.default.countDocuments({ retailerAdminId: id });
        const totalPages = Math.ceil(countSales / pageSize);
        const salesExeclist = yield RetailerSales_1.default.find({ retailerAdminId: id })
            .skip((page - 1) * pageSize).limit(Number(pageSize));
        res.status(200).json({ success: true, message: 'list fetched successfully', salesExeclist, pageSize, totalPages });
    }
    catch (error) {
        console.log('error at sales exec list', error);
        res.status(500).json({ success: false, message: "Error while fetching data" });
    }
});
exports.getSalesList = getSalesList;
const blockSalesExec = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.id;
    const id = req.query.id;
    console.log('id from query is ', id);
    try {
        const validUser = yield RetailerSales_1.default.findById(id);
        if (!validUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isBlocked = validUser.isBlocked;
        const updateStatus = yield RetailerSales_1.default.updateOne({ _id: id }, { $set: { isBlocked: !isBlocked } });
        if (!updateStatus) {
            return res.status(500).json({ success: false, message: 'Error while blocking' });
        }
        if (updateStatus) {
            console.log('updated', updateStatus);
        }
        const salesExeclist = yield RetailerSales_1.default.find({ retailerAdminId: adminId });
        return res.status(200).json({ success: true, message: 'User blocked/unblocked successfully', userlist: salesExeclist });
    }
    catch (error) {
        console.log('error in blocking sales exec', error);
        res.status(500).json({ success: false, message: 'error while blocking user' });
    }
});
exports.blockSalesExec = blockSalesExec;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRole = req.role;
    const userId = req.id;
    console.log('coming here');
    try {
        const verifyUser = yield RetailerAdmin_1.retailerAdmin.findById(userId);
        if (!verifyUser) {
            return res.status(401).json({ success: false, message: 'UnAuthorized user' });
        }
        res.status(200).json({ success: true, message: 'user details fetched successfully', userDetails: verifyUser });
    }
    catch (error) {
        console.log('error at get profile');
        res.status(500).json({ success: false, message: 'Error while fetchin profile' });
    }
});
exports.profile = profile;
const connectedProd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const connected = yield RetailerAdmin_1.retailerAdmin.findOne({ _id: id }).populate('connectedProduction'); // Corrected: Use the string 'connectedProduction'
        const availableProduction = connected === null || connected === void 0 ? void 0 : connected.connectedProduction;
        return res.status(200).json({ success: true, message: 'user list fetched successfully', availableProduction });
    }
    catch (error) {
        console.log('error while getting connected production', error);
        res.status(500);
    }
});
exports.connectedProd = connectedProd;
const avialableProd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req === null || req === void 0 ? void 0 : req.id;
    try {
        const retailer = yield RetailerAdmin_1.retailerAdmin.findById(id);
        const connectedProd = retailer === null || retailer === void 0 ? void 0 : retailer.connectedProduction;
        const availableProduction = yield ProductionAdmin_1.default.find({
            isBlocked: false,
            isVerified: true,
            _id: { $nin: connectedProd }
        });
        // console.log(availableProduction);
        return res.status(200).json({ success: true, message: 'fetched available production units', availableProduction });
    }
    catch (error) {
        console.log('Error while fetching available production list profile', error);
        return res.status(500).json({ success: false, message: 'Error while fetching available production list profile' });
    }
});
exports.avialableProd = avialableProd;
const showProductionprofile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    try {
        const isvalidUser = yield ProductionAdmin_1.default.findById(id);
        if (!isvalidUser) {
            return res.status(401).json({ success: false, message: 'Unauthorized user' });
        }
        if (isvalidUser.isBlocked || !isvalidUser.isVerified) {
            return res.status(403).json({ success: false, message: 'User is blocked' });
        }
        // Calculate the average rating
        const averageRating = yield Reviews_1.default.aggregate([
            {
                $match: {
                    'reviewee.id': mongoose_1.default.Types.ObjectId.createFromHexString(id),
                    'reviewee.type': 'productionUnit'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);
        let averageToFive = 0;
        if (averageRating.length > 0) {
            averageToFive = Math.ceil((averageRating[0].averageRating / 2) * 2) / 2;
        }
        return res.status(200).json({ success: true, message: 'user details fetched successfully', userDetails: isvalidUser, rating: averageToFive });
    }
    catch (error) {
        console.log('error at showproductionprofile', error);
        return res.status(500).json({ success: false, message: 'error file fetching profile details' });
    }
});
exports.showProductionprofile = showProductionprofile;
const sendConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const prodId = req.body.prodId;
    try {
        const verifyRetailerSubscription = yield RetailerAdmin_1.retailerAdmin.findById(id);
        if ((verifyRetailerSubscription === null || verifyRetailerSubscription === void 0 ? void 0 : verifyRetailerSubscription.subscribed.active) == undefined || (verifyRetailerSubscription === null || verifyRetailerSubscription === void 0 ? void 0 : verifyRetailerSubscription.subscribed.active) == false) {
            if ((verifyRetailerSubscription === null || verifyRetailerSubscription === void 0 ? void 0 : verifyRetailerSubscription.connectedProduction) && verifyRetailerSubscription.connectedProduction.length >= 1) {
                // Return or perform your desired action here
                return res.status(200).json({ success: false, message: 'not_subscribed' });
            }
        }
        const validProduction = yield ProductionAdmin_1.default.findById(prodId);
        if ((validProduction === null || validProduction === void 0 ? void 0 : validProduction.isBlocked) || !(validProduction === null || validProduction === void 0 ? void 0 : validProduction.isVerified)) {
            return res.status(403).json({ success: false, message: 'User is blocked' });
        }
        const checkReq = yield ProductionAdmin_1.default.findOne({
            $and: [
                { _id: prodId },
                { requestedRetailer: { $in: [id] } }
            ]
        });
        // console.log('check if already requested', checkReq)
        if (checkReq) {
            return res.status(200).json({ success: true, message: 'already requested' });
        }
        else {
            // const addReqRet = await retailerAdmin.findByIdAndUpdate(id, { $push: { requestedProduction: prodId } }, { new: true });
            // console.log('mongo update', addReqRet);
            const addReqProd = yield ProductionAdmin_1.default.findByIdAndUpdate(prodId, { $push: { requestedRetailer: id } }, { new: true });
            // if (addReqRet && addReqProd) {
            if (addReqProd) {
                return res.status(200).json({ success: true, message: 'requested' });
            }
            else {
                return res.status(404).json({ success: false, message: 'Retailer not found' });
            }
        }
    }
    catch (error) {
        console.error('Error processing connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.sendConnectionRequest = sendConnectionRequest;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const retailerId = req.id;
    const pageSize = 6;
    try {
        const { page = 1 } = req.query;
        const countOrder = yield Order_1.default.countDocuments({ retailerId });
        const totalPages = Math.ceil(countOrder / pageSize);
        const orders = yield Order_1.default.find({ retailerId })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .populate('salesExecId')
            .populate('productionId');
        res.status(200).json({ success: true, orders, countOrder, totalPages });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.getOrder = getOrder;
const addSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { planId, id } = req.query;
    try {
        const fetchplan = yield SubscriptionPlans_1.subscriptionPlans.findById(planId);
        const timeDuration = fetchplan === null || fetchplan === void 0 ? void 0 : fetchplan.duration;
        const currentDate = new Date();
        let endDate = new Date(currentDate);
        let duration = '';
        if (timeDuration == '6') {
            duration = 'six';
            endDate.setDate(currentDate.getDate() + 180); // 180 days from now
        }
        else if (timeDuration == '3') {
            duration = 'three';
            endDate.setDate(currentDate.getDate() + 90);
        }
        const subscription = yield RetailerAdmin_1.retailerAdmin.findByIdAndUpdate(id, {
            $set: {
                subscribed: {
                    endDate: endDate,
                    active: true,
                    duration,
                }
            }
        }, { new: true });
        const newPayment = new Payments_1.default({
            userId: id,
            amount: fetchplan === null || fetchplan === void 0 ? void 0 : fetchplan.amount,
            role: 'RetailerAdmin',
            period: duration
        });
        yield newPayment.save();
        res.status(200).json({ success: true, subscription });
    }
    catch (error) {
        console.log('error while updating subscription', error);
        res.status(500);
    }
});
exports.addSubscription = addSubscription;
const getReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    try {
        const verifyRetailer = yield RetailerAdmin_1.retailerAdmin.findById(userId);
        if (!verifyRetailer) {
            return res.status(403).json({ success: false, message: 'user not found' });
        }
        const orders = yield Order_1.default.aggregate([
            {
                $match: { retailerId: new mongoose_1.default.Types.ObjectId(userId) } // Filter orders for the given retailerId
            },
            {
                $group: {
                    _id: '$salesExecId',
                    totalOrders: { $sum: 1 } // Count the number of orders for each salesExecId
                }
            }
        ]);
        const populatedOrders = yield Order_1.default.populate(orders, { path: '_id', model: 'RetailerSales' });
        const responseData = populatedOrders.map((order) => ({
            retailerName: order._id.username,
            totalOrders: order.totalOrders
        }));
        const orderToProd = yield Order_1.default.aggregate([
            {
                $match: { retailerId: new mongoose_1.default.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: '$productionId',
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        const populatedOrdersToProd = yield Order_1.default.populate(orderToProd, { path: '_id', model: 'ProductionAdmin' });
        const responseDataToProd = populatedOrdersToProd.map((order) => ({
            productionName: order._id.productionName,
            totalOrders: order.totalOrders
        }));
        res.status(200).json({ success: true, message: 'Orders fetched successfully', orders: responseData, ordersToProd: responseDataToProd });
    }
    catch (error) {
        console.log('error while fetching reports', error);
        res.status(500);
    }
});
exports.getReport = getReport;
const fetchRetailPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fetch = yield SubscriptionPlans_1.subscriptionPlans.find({ role: 'retailer', active: true });
        console.log(fetch);
        res.status(200).json({ success: true, fetch });
    }
    catch (error) {
        console.log('error while fetching subscription plans');
        res.status(500);
    }
});
exports.fetchRetailPlans = fetchRetailPlans;
const editDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateDescription = yield RetailerAdmin_1.retailerAdmin.findByIdAndUpdate({ _id: req.id }, { description: req.body.description });
        res.status(200).json({ success: true, message: 'Description is updated successfully' });
    }
    catch (error) {
        console.log('error while updating description');
        res.status(500);
    }
});
exports.editDescription = editDescription;
