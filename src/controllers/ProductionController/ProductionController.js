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
exports.denyEditRequest = exports.acceptEditReq = exports.fetchPlans = exports.getReports = exports.addSubscription = exports.sendConnectionRequest = exports.getRetailerProfile = exports.sortRetailer = exports.searchRetailer = exports.getAvailRetailList = exports.getConnRetailersList = exports.getSalesProfile = exports.availableSales = exports.rejectReq = exports.acceptReq = exports.fetchRequestedRetailers = exports.addItem = exports.getProfile = void 0;
const ProductionAdmin_1 = __importDefault(require("../../models/ProductionAdmin"));
const Order_1 = __importDefault(require("../../models/Order"));
const RetailerSales_1 = __importDefault(require("../../models/RetailerSales"));
const Reviews_1 = __importDefault(require("../../models/Reviews"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const Payments_1 = __importDefault(require("../../models/Payments"));
const RetailerAdmin_1 = require("../../models/RetailerAdmin");
const SubscriptionPlans_1 = require("../../models/SubscriptionPlans");
// Schedule a job to run every day at 12 pm
node_cron_1.default.schedule('0 12 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    yield ProductionAdmin_1.default.updateMany({ 'subscribed.endDate': { $lt: currentDate } }, { $set: { 'subscribed.$.active': false } });
    console.log('Subscription status updated.');
}));
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRole = req.role;
    const userId = req.id;
    const id = req.query.id;
    try {
        const verifyUser = yield ProductionAdmin_1.default.findById(userId);
        if (!verifyUser) {
            return res.status(401).json({ success: false, message: 'UnAuthorized user' });
        }
        // console.log(verifyUser);
        res.status(200).json({ success: true, message: 'user details fetched successfully', userDetails: verifyUser });
    }
    catch (error) {
        console.log('error at fetching profile', error);
        return res.status(500).json({ success: false, message: 'Error while fetching profile' });
    }
});
exports.getProfile = getProfile;
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const { name } = req.body;
    try {
        const verifyUser = yield ProductionAdmin_1.default.findById(userId);
        if (!verifyUser) {
            return res.status(401).json({ success: false, message: 'Unauthorized user' });
        }
        const updateResult = yield ProductionAdmin_1.default.updateOne({ _id: userId }, { $push: { availableItems: name } });
        if (updateResult.acknowledged == false) {
            return res.status(400).json({ success: false, message: 'Failed to add item' });
        }
        const updatedUser = yield ProductionAdmin_1.default.findById(userId);
        return res.json({ success: true, userDetails: updatedUser });
    }
    catch (error) {
        console.log('error at adding item ', error);
        return res.status(500).json({ success: false, message: 'Error while adding item' });
    }
});
exports.addItem = addItem;
const fetchRequestedRetailers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const fetchUser = yield ProductionAdmin_1.default.findById(id).populate('requestedRetailer');
        const notBlockedRetailers = fetchUser === null || fetchUser === void 0 ? void 0 : fetchUser.requestedRetailer.filter((retailer) => !retailer.isBlocked);
        if (notBlockedRetailers.length > 0) {
            // console.log('Some requested retailers are :', notBlockedRetailers);
            // Handle the case where some retailers are blocked
        }
        else {
            // console.log('No requested retailers are blocked.');
            // Handle the case where no retailers are blocked
        }
        return res.status(200).json({ success: true, message: 'fetched users', userDetails: notBlockedRetailers });
    }
    catch (error) {
        console.log('error at fetchReequestedRetailer', error);
        res.status(500);
    }
});
exports.fetchRequestedRetailers = fetchRequestedRetailers;
const acceptReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const retailId = req.body.id;
    try {
        const verifyProduction = yield ProductionAdmin_1.default.findById(id);
        if (verifyProduction === null || verifyProduction === void 0 ? void 0 : verifyProduction.isBlocked) {
            return res.status(403).json({ success: false, message: "unauthorized user" });
        }
        const checkConnectionProd = yield ProductionAdmin_1.default.findOne({
            $and: [
                { _id: id },
                { connectedRetailer: { $in: [retailId] } }
            ]
        });
        const checkConnectionRet = yield RetailerAdmin_1.retailerAdmin.findOne({
            $and: [
                { _id: retailId },
                { connectedProduction: { $in: [id] } }
            ]
        });
        if (checkConnectionProd || checkConnectionRet) {
            yield ProductionAdmin_1.default.findByIdAndUpdate(id, { $pull: { requestedRetailer: retailId } }, { new: true });
            return res.status(200).json({ success: true, message: 'already connected' });
        }
        else {
            const updateProd = yield ProductionAdmin_1.default.findByIdAndUpdate(id, { $push: { connectedRetailer: retailId } }, { new: true });
            const updateRet = yield RetailerAdmin_1.retailerAdmin.findByIdAndUpdate(retailId, { $push: { connectedProduction: id } }, { new: true });
            yield ProductionAdmin_1.default.findByIdAndUpdate(id, { $pull: { requestedRetailer: retailId } }, { new: true });
            return res.status(200).json({ success: true, message: 'User connected' });
        }
    }
    catch (error) {
        console.error('Error processing connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.acceptReq = acceptReq;
const rejectReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const retailerId = req.query.id;
    console.log('profile id is========', retailerId);
    try {
        const deleteReq = yield ProductionAdmin_1.default.findByIdAndUpdate(id, { $pull: { requestedRetailer: retailerId } }, { new: true });
        res.status(200).json({ success: true, message: 'Connection Request rejected' });
    }
    catch (error) {
        console.error('Error rejecting connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.rejectReq = rejectReq;
const availableSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const productionAdminDoc = yield ProductionAdmin_1.default.findById(id).populate('connectedRetailer');
        const connectedRetailerId = productionAdminDoc === null || productionAdminDoc === void 0 ? void 0 : productionAdminDoc.connectedRetailer.map((retailer) => retailer._id);
        const salesExecutive = yield RetailerSales_1.default.find({
            retailerAdminId: { $in: connectedRetailerId },
            isBlocked: false
        });
        return res.status(200).json({ success: true, message: 'Sales executives list fetched successfully', salesExecutive });
    }
    catch (error) {
        console.log('Error at fetching sales executives', error);
        return res.status(500).json({ success: false, message: 'Error at fetching sales executives' });
    }
});
exports.availableSales = availableSales;
const getSalesProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const salesId = req.body.salesId;
    try {
        const salesExecutive = yield RetailerSales_1.default.findById(salesId);
        if (salesExecutive === null || salesExecutive === void 0 ? void 0 : salesExecutive.isBlocked) {
            return res.status(403).json({ success: false, message: 'user is blocked' });
        }
        res.status(200).json({ success: true, salesExecutive });
    }
    catch (error) {
        console.log('Error at fetching sales executives', error);
        return res.status(500).json({ success: false, message: 'Error at fetching sales executives' });
    }
});
exports.getSalesProfile = getSalesProfile;
const getConnRetailersList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    console.log(req.query, 'in  connected');
    const { search, sort } = req.query;
    console.log(search, sort);
    if (typeof search !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Invalid search value",
        });
    }
    try {
        let query = { isBlocked: false, isVerified: true };
        if (search) {
            query.retailerName = { $regex: new RegExp(search, 'i') };
        }
        const connectedRetailer = yield ProductionAdmin_1.default.findById(id).populate('connectedRetailer');
        let connected = connectedRetailer === null || connectedRetailer === void 0 ? void 0 : connectedRetailer.connectedRetailer;
        if (search && connected) {
            connected = connected.filter((retailer) => retailer.retailerName.match(new RegExp(search, 'i')));
        }
        if (sort && sort === '1') {
            connected = connected === null || connected === void 0 ? void 0 : connected.sort((a, b) => {
                var _a, _b;
                const nameA = (_a = a.retailerName) === null || _a === void 0 ? void 0 : _a.toUpperCase();
                const nameB = (_b = b.retailerName) === null || _b === void 0 ? void 0 : _b.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        }
        console.log(connected);
        res.status(200).json({ success: true, message: 'fetched successfully', connected });
    }
    catch (error) {
        console.log('Error while fetching connected retailers', error);
        return res.status(500).json({ success: false, message: 'Error at  while fetching connected retailers' });
    }
});
exports.getConnRetailersList = getConnRetailersList;
const getAvailRetailList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    console.log('in avialable', req.query);
    const pageSize = 6;
    try {
        const { page = 1 } = req.query;
        const production = yield ProductionAdmin_1.default.findById(id);
        const connectedRetailer = production === null || production === void 0 ? void 0 : production.connectedRetailer;
        const availableRetailerCount = yield RetailerAdmin_1.retailerAdmin.countDocuments({
            isBlocked: false,
            isVerified: true,
            _id: { $nin: connectedRetailer }
        });
        const totalPages = Math.ceil(availableRetailerCount / pageSize);
        // console.log('count of available retailers list,--------',availableRetailerCount)
        const availableRetailer = yield RetailerAdmin_1.retailerAdmin.find({
            isBlocked: false,
            isVerified: true,
            _id: { $nin: connectedRetailer }
        }).skip((page - 1) * pageSize)
            .limit(Number(pageSize));
        // console.log('available retailer', availableRetailer)
        res.status(200).json({ success: true, availableRetailer, availableRetailerCount, totalPages });
    }
    catch (error) {
        console.log('error while fetching available retailers', error);
        res.status(500).json({ success: false, message: 'Error while fetching available retailers' });
    }
});
exports.getAvailRetailList = getAvailRetailList;
const searchRetailer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchVal = req.query.value;
    if (typeof searchVal !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Invalid search value",
        });
    }
    try {
        const searchPattern = new RegExp(searchVal, 'i');
        // Use the $regex operator to find retailers whose name matches the pattern
        const searchRetailer = yield RetailerAdmin_1.retailerAdmin.find({
            retailerName: { $regex: searchPattern },
            isBlocked: false,
            isVerified: true
        });
        if (searchRetailer.length > 0) {
            res.status(200).json({
                success: true,
                message: "Retailers found",
                retailers: searchRetailer
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: "No retailers found matching the search criteria",
                retailers: []
            });
        }
    }
    catch (error) {
        console.log('error while searching data', error);
        res.status(500);
    }
});
exports.searchRetailer = searchRetailer;
const sortRetailer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const value = req.query.value;
    console.log('sort value', value);
    try {
        const sortOrder = value === '1' ? 1 : -1;
        const retailerRatings = yield Reviews_1.default.aggregate([
            {
                $group: {
                    _id: '$reviewee.id', // Group by retailer id
                    averageRating: { $avg: '$rating' } // Calculate average rating
                }
            },
            {
                $sort: { averageRating: sortOrder } // Sort by average rating
            }
        ]);
        for (const rating of retailerRatings) {
            yield RetailerAdmin_1.retailerAdmin.updateOne({ _id: rating._id }, { averageRating: rating.averageRating });
        }
        const sortedRetailers = yield RetailerAdmin_1.retailerAdmin.find({ isBlocked: false, isVerified: true }).sort({ averageRating: sortOrder });
        console.log('sorted retailers', sortedRetailers);
        res.status(200).json({ sortedRetailers, success: true });
    }
    catch (error) {
        console.log('error while sorting', error);
        res.status(500);
    }
});
exports.sortRetailer = sortRetailer;
const getRetailerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const retailerProfile = yield RetailerAdmin_1.retailerAdmin.findById(id);
        if (retailerProfile === null || retailerProfile === void 0 ? void 0 : retailerProfile.isBlocked) {
            return res.status(403).json({ success: false, message: 'user is blocked' });
        }
        // Calculate the average rating
        const averageRating = yield Reviews_1.default.aggregate([
            {
                $match: {
                    'reviewee.id': mongoose_1.default.Types.ObjectId.createFromHexString(id),
                    'reviewee.type': 'retailer'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);
        // console.log('adkfljaksdljfas', averageRating)
        let averageToFive = 0;
        if (averageRating.length > 0) {
            averageToFive = Math.ceil((averageRating[0].averageRating / 2) * 2) / 2;
        }
        // console.log('average to 555', averageToFive)
        res.status(200).json({ success: true, retailerProfile, message: 'user profile fetched successfully', rating: averageToFive });
    }
    catch (error) {
        console.log('ERror while fetching retailer individual profile');
        res.status(500).json({ success: false, message: 'error while fetching details' });
    }
});
exports.getRetailerProfile = getRetailerProfile;
const sendConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('data from tne sgkdjkd body', req.body)
    const productionId = req.body.productionId;
    const retailerId = req.body.retailId;
    try {
        const verifyProductionSubscription = yield ProductionAdmin_1.default.findById(productionId);
        if ((verifyProductionSubscription === null || verifyProductionSubscription === void 0 ? void 0 : verifyProductionSubscription.subscribed.active) == undefined || (verifyProductionSubscription === null || verifyProductionSubscription === void 0 ? void 0 : verifyProductionSubscription.subscribed.active) == false) {
            if ((verifyProductionSubscription === null || verifyProductionSubscription === void 0 ? void 0 : verifyProductionSubscription.connectedRetailer) && verifyProductionSubscription.connectedRetailer.length >= 1) {
                console.log('the array is greater than 1 and is not premium also so returning');
                return res.status(200).json({ success: false, message: 'not_subscribed' });
            }
        }
        const validRetailer = yield RetailerAdmin_1.retailerAdmin.findById(retailerId);
        if ((validRetailer === null || validRetailer === void 0 ? void 0 : validRetailer.isBlocked) || !(validRetailer === null || validRetailer === void 0 ? void 0 : validRetailer.isVerified)) {
            return res.status(403).json({ success: false, message: 'user is blocked' });
        }
        const checkReq = yield RetailerAdmin_1.retailerAdmin.findOne({
            $and: [
                { _id: retailerId },
                { requestedProduction: { $in: [productionId] } }
            ]
        });
        if (checkReq) {
            return res.status(200).json({ success: true, message: 'Already requested' });
        }
        else {
            // const addReqProd = await productionAdmin.findByIdAndUpdate(productionId, { $push: { requestedRetailer: retailerId } }, { new: true })
            // console.log('add req production');
            const addReqRet = yield RetailerAdmin_1.retailerAdmin.findByIdAndUpdate(retailerId, { $push: { requestedProduction: productionId } }, { new: true });
            if (addReqRet) {
                return res.status(200).json({ success: true, message: 'Request send Successfully' });
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
        const subscription = yield ProductionAdmin_1.default.findByIdAndUpdate(id, {
            $set: {
                subscribed: {
                    endDate: endDate,
                    active: true,
                    duration
                }
            }
        }, { new: true });
        const newPayment = new Payments_1.default({
            userId: id,
            amount: fetchplan === null || fetchplan === void 0 ? void 0 : fetchplan.amount,
            role: 'ProductionAdmin',
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
const getReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const orders = yield Order_1.default.aggregate([
            {
                $match: { productionId: new mongoose_1.default.Types.ObjectId(id) }
            },
            {
                $group: {
                    _id: '$retailerId',
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        console.log(orders);
        const populateRetailer = yield Order_1.default.populate(orders, { path: '_id', model: 'RetailerAdmin' });
        const responseData = populateRetailer.map((ord) => ({
            retailerName: ord._id.retailerName,
            totalOrders: ord.totalOrders
        }));
        console.log('responsse data', responseData);
        res.status(200).json({ success: true, pieChart: responseData });
    }
    catch (error) {
        console.log('error while fetching reports', error);
        res.status(500);
    }
});
exports.getReports = getReports;
const fetchPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fetch = yield SubscriptionPlans_1.subscriptionPlans.find({ role: 'production', active: true });
        console.log(fetch);
        res.status(200).json({ success: true, fetch });
    }
    catch (error) {
        console.log('error while fetching subscription plans');
        res.status(500);
    }
});
exports.fetchPlans = fetchPlans;
const acceptEditReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    try {
        const updateReq = yield Order_1.default.findByIdAndUpdate(req.body.orderId, { $set: { updateRequest: 'Granted' } }, { new: true });
        if (updateReq) {
            console.log('Order updated successfully:', updateReq);
        }
        else {
            console.log('Order not found', updateReq);
            return res.status(404).json({ success: false });
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log('error while updating edit req', error);
        res.status(500).json({ success: false, message: 'error while updating edit req' });
    }
});
exports.acceptEditReq = acceptEditReq;
const denyEditRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('herere');
    console.log(req.body.orderId);
    try {
        const updateOrder = yield Order_1.default.findByIdAndUpdate(req.body.orderId, { $set: { updateRequest: "Denied" } }, { new: true });
        if (updateOrder) {
            console.log('Order updated successfully:', updateOrder);
        }
        else {
            console.log('Order not found', updateOrder);
            return res.status(404).json({ success: false });
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log('Error while rejecting edit request', error);
    }
});
exports.denyEditRequest = denyEditRequest;
