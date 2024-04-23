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
exports.getReport = exports.checkSubscription = exports.productionProfile = exports.deleteOrder = exports.editOrder = exports.editOrderRequest = exports.fetchOrder = exports.createOrder = exports.viewIndividualprofile = exports.getAvailableProduction = void 0;
const RetailerSales_1 = __importDefault(require("../../models/RetailerSales"));
const ProductionAdmin_1 = __importDefault(require("../../models/ProductionAdmin"));
const Order_1 = __importDefault(require("../../models/Order"));
const Reviews_1 = __importDefault(require("../../models/Reviews"));
const mongoose_1 = __importDefault(require("mongoose"));
const RetailerAdmin_1 = require("../../models/RetailerAdmin");
// view sales executive
const getAvailableProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const pageSize = 6;
    try {
        const { page = 1 } = req.query;
        const findAdmin = yield RetailerSales_1.default.findById(id);
        // console.log(findAdmin?.retailerAdminId);
        const adminId = findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.retailerAdminId;
        const findProd = yield RetailerAdmin_1.retailerAdmin.findOne({ _id: adminId }).populate('connectedProduction'); // Specify the path to populate
        const connected = findProd === null || findProd === void 0 ? void 0 : findProd.connectedProduction;
        const totalProd = connected === null || connected === void 0 ? void 0 : connected.length;
        return res.status(200).json({ success: true, message: 'user list fetched successfully', availableProduction: connected });
    }
    catch (error) {
        console.log('error at fetching available production unit');
        return res.status(500).json({ success: false, message: 'Error while fetching data' });
    }
});
exports.getAvailableProduction = getAvailableProduction;
const viewIndividualprofile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productionId = req.query.id;
    // console.log('production id', productionId);
    try {
        const production = yield ProductionAdmin_1.default.findById(productionId);
        if ((production === null || production === void 0 ? void 0 : production.isBlocked) || !(production === null || production === void 0 ? void 0 : production.isVerified)) {
            return res.status(401).json({ success: false, message: 'User is blocked' });
        }
        // Calculate the average rating
        const averageRating = yield Reviews_1.default.aggregate([
            {
                $match: {
                    'reviewee.id': mongoose_1.default.Types.ObjectId.createFromHexString(productionId),
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
        console.log('rating is -=-=-=-', averageToFive);
        return res.status(200).json({ success: true, message: 'user profile fetched successfully', userDetails: production, rating: averageToFive });
    }
    catch (error) {
        console.log('error at fetching individual profile', error);
        res.status(500).json({ success: false, message: 'error while user profile fetching' });
    }
});
exports.viewIndividualprofile = viewIndividualprofile;
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    // console.log('sales id ', id);
    // console.log('in createorder------', req.body);
    const { productionId, selectedProduct, scheduledDate, quantity, urls, description } = req.body;
    // console.log('production id', productionId, 'selectedproduct', selectedProduct, 'scheduled date', scheduledDate, 'quantity', quantity, 'urls', urls, 'description', description);
    try {
        const date = new Date(scheduledDate);
        const validProduction = yield ProductionAdmin_1.default.findById(productionId);
        if (validProduction === null || validProduction === void 0 ? void 0 : validProduction.isBlocked) {
            return res.status(403).json({ success: false, message: 'Production unit is blocked' });
        }
        const validSalesExec = yield RetailerSales_1.default.findById(id);
        const retailerAdmin = validSalesExec === null || validSalesExec === void 0 ? void 0 : validSalesExec.retailerAdminId;
        const newOrder = new Order_1.default({
            productionId,
            item: selectedProduct,
            salesExecId: id,
            retailerId: retailerAdmin,
            scheduledDate: date,
            imageURL: urls,
            quantity: quantity,
            status: "Pending",
            description: description,
            accepted: 'No'
        });
        yield newOrder.save();
        res.status(200).json({ success: true, message: 'order created successfully' });
    }
    catch (error) {
        console.log('error at creating order', error);
        res.status(500).json({ success: false, message: 'Error while creating order' });
    }
});
exports.createOrder = createOrder;
const fetchOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const pageSize = 2;
    try {
        const { page = 1 } = req.query;
        const totalOrders = yield Order_1.default.countDocuments({
            salesExecId: id
        });
        const totalPages = Math.ceil(totalOrders / pageSize);
        const getOrder = yield Order_1.default.find({
            salesExecId: id
        }).skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .populate('productionId');
        // console.log('orders are', getOrder);
        console.log('pagesixe', pageSize, 'totalpages', totalPages);
        res.status(200).json({ success: true, message: 'order fetched successfully', orders: getOrder, totalOrders, totalPages });
    }
    catch (error) {
        console.log('error at fetching order of sales executive', error);
        res.status(500).json({ success: false, message: 'error while fetching orders' });
    }
});
exports.fetchOrder = fetchOrder;
const editOrderRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.body.orderId;
    // console.log(orderId, 'from edit order request');
    try {
        const editOrder = yield Order_1.default.findById(orderId);
        if (!editOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        editOrder.updateRequest = 'Requested';
        editOrder.save();
        return res.status(200).json({ success: true, message: 'requested for editing' });
    }
    catch (error) {
        console.log('error at requesting for edit', error);
        res.status(500).json({ success: false, message: 'error at requesting for edit' });
    }
});
exports.editOrderRequest = editOrderRequest;
const editOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const id = req.id
    // console.log('from req.body', req.body);
    // try {
    const id = req.id;
    console.log('from req.body', req.body);
    const { orderId, scheduledDate, quantity, description } = req.body;
    try {
        const updateFields = {};
        if (scheduledDate) {
            updateFields.scheduledDate = scheduledDate;
        }
        if (quantity) {
            updateFields.quantity = quantity;
        }
        if (description) {
            updateFields.description = description;
        }
        updateFields.updateRequest = '';
        const updatedOrder = yield Order_1.default.findByIdAndUpdate(orderId, {
            $set: updateFields,
        }, { new: true });
        if (updatedOrder) {
            console.log('Order updated successfully:', updatedOrder);
            res.status(200).json({ success: true, updatedOrder });
        }
        else {
            console.log('Order not found');
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    }
    catch (error) {
        console.log('error while editing order', error);
        res.status(500);
    }
});
exports.editOrder = editOrder;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const orderId = req.body.orderId;
    try {
        const validOrder = yield Order_1.default.findByIdAndDelete(orderId);
        return res.status(200).json({ success: true, message: 'Order deleted successfully' });
    }
    catch (error) {
        console.log('error while deleting order', error);
        res.status(500).json({ success: false, message: 'Error in deleting order' });
    }
});
exports.deleteOrder = deleteOrder;
// 
const productionProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prodId = req.body.prodId;
    // console.log('productionId', prodId)
    try {
        const profile = yield ProductionAdmin_1.default.findById(prodId);
        if (profile === null || profile === void 0 ? void 0 : profile.isBlocked) {
            return res.status(403).json({ success: false, message: 'user is blocked' });
        }
        res.status(200).json({ success: true, profile });
    }
    catch (error) {
        console.log('error while fetching production ', error);
        res.status(500).json({ success: false, message: 'error while fetching production' });
    }
});
exports.productionProfile = productionProfile;
const checkSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const verifySales = yield RetailerSales_1.default.findById(id);
        if (verifySales) {
            const salesAdmin = verifySales.retailerAdminId;
            const verifyAdmin = yield RetailerAdmin_1.retailerAdmin.findById(salesAdmin);
            return res.status(200).json({ success: true, admin: verifyAdmin === null || verifyAdmin === void 0 ? void 0 : verifyAdmin.subscribed });
        }
    }
    catch (error) {
        console.log('error while checking for subscription', error);
        res.status(500);
    }
});
exports.checkSubscription = checkSubscription;
const getReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const OrderCount = yield Order_1.default.countDocuments({ salesExecId: id });
        const salesExec = yield RetailerSales_1.default.findById(id);
        const retailerAdminId = salesExec === null || salesExec === void 0 ? void 0 : salesExec.retailerAdminId;
        const orders = yield Order_1.default.aggregate([
            {
                $match: { retailerId: new mongoose_1.default.Types.ObjectId(retailerAdminId) }
            }, {
                $group: {
                    _id: '$salesExecId',
                    totalOrders: { $sum: 1 }
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
                $match: { salesExecId: new mongoose_1.default.Types.ObjectId(id) }
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
            productionAdmin: order._id.productionName,
            totalOrders: order.totalOrders
        }));
        res.status(200).json({ success: true, OrderCount, barChart: responseData, pieChart: responseDataToProd });
    }
    catch (error) {
        console.log('error while fetching report', error);
        res.status(500);
    }
});
exports.getReport = getReport;
