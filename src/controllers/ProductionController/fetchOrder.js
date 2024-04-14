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
exports.countOrder = exports.rejectOrder = exports.acceptOrder = exports.fetchOrdersAll = void 0;
const Order_1 = __importDefault(require("../../models/Order"));
const fetchOrdersAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const filter = req.query.filter;
    const pageSize = 2;
    if (filter == 'Edit_request') {
        console.log(filter);
        try {
            const { page = 1 } = req.query;
            const totalOrders = yield Order_1.default.countDocuments({
                productionId: id,
                updateRequest: 'Requested'
            });
            const totalpages = Math.ceil(totalOrders / pageSize);
            const orders = yield Order_1.default.find({
                productionId: id,
                updateRequest: 'Requested'
            }).skip((page - 1) * pageSize)
                .limit(Number(pageSize))
                .populate('retailerId')
                .populate('salesExecId');
            console.log(orders);
            return res.status(200).json({ success: true, message: 'order list fetched successfully', orders, totalOrders, totalPages: totalpages });
        }
        catch (error) {
            console.log('error while fetching update request');
            res.status(500);
        }
    }
    if (filter == 'New_Requests') {
        console.log(filter);
        // const skip = (page - 1) * limit;
        try {
            const { page = 1 } = req.query;
            const totalOrders = yield Order_1.default.countDocuments({
                productionId: id,
                accepted: "No"
            });
            const totalpages = Math.ceil(totalOrders / pageSize);
            const orders = yield Order_1.default.find({
                productionId: id,
                accepted: "No"
            }).skip((page - 1) * pageSize)
                .limit(Number(pageSize))
                .populate('retailerId')
                .populate('salesExecId');
            console.log(orders);
            return res.status(200).json({ success: true, message: 'order list fetched successfully', orders, totalOrders, totalPages: totalpages });
        }
        catch (error) {
            console.log('error while fetching update request');
            res.status(500);
        }
    }
    if (filter == 'Pending') {
        // const skip = (page - 1) * limit;
        console.log(filter);
        try {
            const { page = 1 } = req.query;
            const totalOrders = yield Order_1.default.countDocuments({
                productionId: id,
                accepted: 'Yes',
                status: 'Pending'
            });
            const totalpages = Math.ceil(totalOrders / pageSize);
            const orders = yield Order_1.default.find({
                productionId: id,
                accepted: 'Yes',
                status: 'Pending'
            }).skip((page - 1) * pageSize)
                .limit(Number(pageSize))
                .populate('retailerId')
                .populate('salesExecId');
            console.log(orders);
            return res.status(200).json({ success: true, message: 'order list fetched successfully', orders, totalOrders, totalPages: totalpages });
        }
        catch (error) {
            console.log('error while fetching update request');
            res.status(500);
        }
    }
    if (filter == 'Completed') {
        console.log(filter);
        // const skip = (page - 1) * limit;
        try {
            const { page = 1 } = req.query;
            const totalOrders = yield Order_1.default.countDocuments({
                productionId: id,
                status: 'Completed'
            });
            const totalpages = Math.ceil(totalOrders / pageSize);
            const orders = yield Order_1.default.find({
                productionId: id,
                status: 'Completed'
            }).skip((page - 1) * pageSize)
                .limit(Number(pageSize))
                .populate('retailerId')
                .populate('salesExecId');
            console.log(orders);
            return res.status(200).json({ success: true, message: 'order list fetched successfully', orders, totalOrders, totalPages: totalpages });
        }
        catch (error) {
            console.log('error while fetching update request');
            res.status(500);
        }
    }
    else if (filter == "All") {
        console.log(filter);
        try {
            const { page = 1 } = req.query;
            const totalOrders = yield Order_1.default.countDocuments({
                productionId: id
            });
            const totalpages = Math.ceil(totalOrders / pageSize);
            console.log('count documents', totalOrders, 'total pages', totalpages);
            const orders = yield Order_1.default.find({
                productionId: id
            }).skip((page - 1) * pageSize)
                .limit(Number(pageSize))
                .populate('retailerId')
                .populate('salesExecId');
            // console.log(orders);
            return res.status(200).json({ success: true, message: 'order list fetched successfully', orders, totalOrders, totalPages: totalpages });
        }
        catch (error) {
            console.log('error at fetch order', error);
            return res.status(500).json({ success: false, message: 'error at fetching order ' });
        }
    }
});
exports.fetchOrdersAll = fetchOrdersAll;
const acceptOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const orderId = req.body.orderId;
    try {
        const existingOrder = yield Order_1.default.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found!' });
        }
        existingOrder.accepted = 'Yes';
        yield existingOrder.save();
        return res.status(200).json({ success: true, message: 'Order accepted' });
    }
    catch (error) {
        console.log('error at accepting order', error);
        return res.status(500).json({ success: false, message: 'error at accepting order ' });
    }
});
exports.acceptOrder = acceptOrder;
const rejectOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    const orderId = req.body.orderId;
    // console.log('coming to reject order', id, orderId);
    try {
        const existingOrder = yield Order_1.default.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found!' });
        }
        existingOrder.accepted = 'Rejected';
        yield existingOrder.save();
        return res.status(200).json({ success: true, message: 'Order rejected' });
    }
    catch (error) {
        console.log('error at rejecting order', error);
        return res.status(500).json({ success: false, message: 'error at rejecting order ' });
    }
});
exports.rejectOrder = rejectOrder;
const countOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const countOrder = yield Order_1.default.countDocuments({ productionId: id });
        console.log(countOrder);
        return res.status(200).json({ success: true, countOrder });
    }
    catch (error) {
        console.log('error at count order ', error);
        res.status(500);
    }
});
exports.countOrder = countOrder;
