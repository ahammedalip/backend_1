import express, { Request, Response } from "express";
import retailerSales from "../../models/RetailerSales";
import exp from "constants";
import productionAdmin from "../../models/ProductionAdmin";
import order from "../../models/Order";
import { Document, Model, model, Mongoose, Schema, Types } from 'mongoose';
import reviews from "../../models/Reviews";
import mongoose from 'mongoose';
import { CustomRequest } from "../../interfaces/interfaces";
import path from "path";
import { retailerAdmin } from "../../models/RetailerAdmin";

// view sales executive




export const getAvailableProduction = async (req: CustomRequest, res: Response) => {
    const id = req.id;
    const pageSize: number = 6
    try {
        const { page = 1 } = req.query as { page?: number }
        const findAdmin = await retailerSales.findById(id)
        // console.log(findAdmin?.retailerAdminId);
        const adminId = findAdmin?.retailerAdminId;



        const findProd = await retailerAdmin.findOne(
            { _id: adminId }
        ).populate('connectedProduction'); // Specify the path to populate

        const connected = findProd?.connectedProduction
        const totalProd = connected?.length


        return res.status(200).json({ success: true, message: 'user list fetched successfully', availableProduction: connected })

    } catch (error) {
        console.log('error at fetching available production unit');
        return res.status(500).json({ success: false, message: 'Error while fetching data' })
    }

}

export const viewIndividualprofile = async (req: Request, res: Response) => {
    const productionId = req.query.id
    // console.log('production id', productionId);
    try {
        const production = await productionAdmin.findById(productionId)

        if (production?.isBlocked || !production?.isVerified) {
            return res.status(401).json({ success: false, message: 'User is blocked' })
        }
        // Calculate the average rating
        const averageRating = await reviews.aggregate([
            {
                $match: {
                    'reviewee.id': mongoose.Types.ObjectId.createFromHexString(productionId as string),
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


        let averageToFive = 0

        if (averageRating.length > 0) {
            averageToFive = Math.ceil((averageRating[0].averageRating / 2) * 2) / 2;
        }
        console.log('rating is -=-=-=-', averageToFive)
        return res.status(200).json({ success: true, message: 'user profile fetched successfully', userDetails: production, rating: averageToFive })
    } catch (error) {
        console.log('error at fetching individual profile', error);
        res.status(500).json({ success: false, message: 'error while user profile fetching' })
    }
}

export const createOrder = async (req: CustomRequest, res: Response) => {
    const id = req.id;
    // console.log('sales id ', id);
    // console.log('in createorder------', req.body);
    const { productionId, selectedProduct, scheduledDate, quantity, urls, description } = req.body
    // console.log('production id', productionId, 'selectedproduct', selectedProduct, 'scheduled date', scheduledDate, 'quantity', quantity, 'urls', urls, 'description', description);
    try {
        const date = new Date(scheduledDate);
        const validProduction = await productionAdmin.findById(productionId)
        if (validProduction?.isBlocked) {
            return res.status(403).json({ success: false, message: 'Production unit is blocked' })
        }

        const validSalesExec = await retailerSales.findById(id)
        const retailerAdmin = validSalesExec?.retailerAdminId


        const newOrder = new order({
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
        })
        await newOrder.save();
        res.status(200).json({ success: true, message: 'order created successfully' })

    } catch (error) {
        console.log('error at creating order', error);
        res.status(500).json({ success: false, message: 'Error while creating order' })
    }

}

export const fetchOrder = async (req: CustomRequest, res: Response) => {

    const id = req.id
    const pageSize: number = 2;
    try {
        const { page = 1 } = req.query as { page?: number }

        const totalOrders = await order.countDocuments({
            salesExecId: id
        })
        const totalPages = Math.ceil(totalOrders / pageSize)
        const getOrder = await order.find({
            salesExecId: id
        }).skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .populate('productionId')
        // console.log('orders are', getOrder);
        console.log('pagesixe', pageSize, 'totalpages', totalPages);


        res.status(200).json({ success: true, message: 'order fetched successfully', orders: getOrder, totalOrders, totalPages })

    } catch (error) {
        console.log('error at fetching order of sales executive', error);
        res.status(500).json({ success: false, message: 'error while fetching orders' })
    }
}

export const editOrderRequest = async (req: Request, res: Response) => {
    const orderId = req.body.orderId
    // console.log(orderId, 'from edit order request');
    try {
        const editOrder = await order.findById(orderId)

        if (!editOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        editOrder.updateRequest = 'Requested'
        editOrder.save()
        return res.status(200).json({ success: true, message: 'requested for editing' })


    } catch (error) {
        console.log('error at requesting for edit', error);
        res.status(500).json({ success: false, message: 'error at requesting for edit' })
    }
}

export const editOrder = async (req: CustomRequest, res: Response) => {
    const id = req.id
    console.log('from req.body', req.body);
    try {


    } catch (error) {
        console.log('error while editing order', error)
        res.status(500)
    }
}

export const deleteOrder = async (req: CustomRequest, res: Response) => {
    const id = req.id
    const orderId = req.body.orderId
    try {
        const validOrder = await order.findByIdAndDelete(orderId)
        return res.status(200).json({ success: true, message: 'Order deleted successfully' })
    } catch (error) {
        console.log('error while deleting order', error);
        res.status(500).json({ success: false, message: 'Error in deleting order' })
    }
}


// 
export const productionProfile = async (req: Request, res: Response) => {

    const prodId = req.body.prodId
    // console.log('productionId', prodId)

    try {
        const profile = await productionAdmin.findById(prodId)
        if (profile?.isBlocked) {
            return res.status(403).json({ success: false, message: 'user is blocked' })
        }

        res.status(200).json({ success: true, profile })

    } catch (error) {
        console.log('error while fetching production ', error);
        res.status(500).json({ success: false, message: 'error while fetching production' })
    }
}


export const checkSubscription = async (req: Request, res: Response) => {
    const id = req.query.id
    try {
        const verifySales = await retailerSales.findById(id)
        if (verifySales) {
            const salesAdmin = verifySales.retailerAdminId

            const verifyAdmin = await retailerAdmin.findById(salesAdmin)

            return res.status(200).json({ success: true, admin: verifyAdmin?.subscribed })
        }
    } catch (error) {
        console.log('error while checking for subscription', error)
        res.status(500)
    }
}

export const getReport = async (req: CustomRequest, res: Response) => {
    const id = req.id;
    try {
        const OrderCount = await order.countDocuments({ salesExecId: id })

        const salesExec = await retailerSales.findById(id)
        const retailerAdminId = salesExec?.retailerAdminId

        const orders = await order.aggregate([
            {
                $match: { retailerId: new mongoose.Types.ObjectId(retailerAdminId) }
            }, {
                $group: {
                    _id: '$salesExecId',
                    totalOrders: { $sum: 1 }
                }
            }
        ])
        const populatedOrders = await order.populate(orders, { path: '_id', model: 'RetailerSales' })
        const responseData = populatedOrders.map((order: any) => ({
            retailerName: order._id.username,
            totalOrders: order.totalOrders
        }))

        const orderToProd = await order.aggregate([
            {
                $match: { salesExecId: new mongoose.Types.ObjectId(id) }
            },
            {
                $group: {
                    _id: '$productionId',
                    totalOrders: { $sum: 1 }
                }
            }
        ])

        const populatedOrdersToProd = await order.populate(orderToProd, { path: '_id', model: 'ProductionAdmin' })
        const responseDataToProd = populatedOrdersToProd.map((order: any) => ({
            productionAdmin: order._id.productionName,
            totalOrders: order.totalOrders
        }))
        res.status(200).json({ success: true, OrderCount, barChart: responseData , pieChart:responseDataToProd})
    } catch (error) {
        console.log('error while fetching report', error)
        res.status(500)
    }
}