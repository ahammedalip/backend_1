import { Request, Response, RequestHandler } from "express";
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs'
import nodemailer from 'nodemailer';
import retailerSales from "../../models/RetailerSales";
import productionAdmin from "../../models/ProductionAdmin";
import order from "../../models/Order";
import reviews from "../../models/Reviews";
import cron from 'node-cron'
import payment from "../../models/Payments";
import { CustomRequest } from "../../interfaces/interfaces";
import { retailerAdmin } from "../../models/RetailerAdmin";
import { subscriptionPlans } from "../../models/SubscriptionPlans";


// Schedule a job to run every day at 12 pm
cron.schedule('0 12 * * *', async () => {
    const currentDate = new Date();
    await retailerAdmin.updateMany(
        { 'subscribed.endDate': { $lt: currentDate } },
        { $set: { 'subscribed.$.active': false } }
    );
    console.log('Subscription status updated.');
});


export const addSalesExecutive = async (req: Request, res: Response) => {

    const { data, id } = req.body
    const { username, password, email } = data

    try {
        const validAdmin = await retailerAdmin.findById(id)
        if (validAdmin?.isBlocked || !validAdmin?.isVerified) {
            return res.status(403).json({ success: false, message: 'Please login again' })
        }
        const modUsername = username + '@' + validAdmin.retailerName;

        const existingUsername = await retailerSales.findOne({ username })
        const existingEmail = await retailerSales.findOne({ email });

        if (existingEmail || existingUsername) {
            return res.status(409).json({ success: false, message: "Email or username already exists" })
        }
        console.log(modUsername);
        const hashedPass = bcryptjs.hashSync(password, 2)


        const newSalesExec = new retailerSales({
            username: modUsername,
            email,
            password: hashedPass,
            retailerAdminId: id
        })

        newSalesExec.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ahmd.work12@gmail.com',
                pass: 'awbs lrfg gwgv zqvg'
            }
        })

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
                return res.status(400).json({ success: false, message: "Error at sending mail" })
            } else {
                console.log('Email sent: ' + info.response);
                res.status(250).json({ success: true, message: 'User registered and email sent successfully' })
            }
        });

    } catch (error) {
        console.log('error at addSalesExecutive', error);
        res.status(500).json({ success: false, message: "Error while adding sales executive" })
    }
}


export const getSalesList = async (req: CustomRequest, res: Response) => {
    // const id = req.query.id;
    // try {
    //     const validAdmin = await retailerAdmin.findById(id)
    //     if (!validAdmin) {
    //         return res.status(403).json({ success: false, message: "Please login" })
    //     }
    //     const salesExeclist = await retailerSales.find({ retailerAdminId: id })
    //     res.status(200).json({ success: true, message: 'list fetched successfully', salesExeclist })
    const id = req.id;
    const pageSize: number = 10
    try {
        const { page = 1 } = req.query as { page?: number }

        const countSales = await retailerSales.countDocuments({ retailerAdminId: id })
        const totalPages = Math.ceil(countSales / pageSize)

        const salesExeclist = await retailerSales.find({ retailerAdminId: id })
            .skip((page - 1) * pageSize).limit(Number(pageSize))
        res.status(200).json({ success: true, message: 'list fetched successfully', salesExeclist, pageSize, totalPages })
    } catch (error) {
        console.log('error at sales exec list', error);
        res.status(500).json({ success: false, message: "Error while fetching data" })
    }
}

export const blockSalesExec = async (req: CustomRequest, res: Response) => {
    const adminId = req.id
    const id = req.query.id
    console.log('id from query is ', id);

    try {
        const validUser = await retailerSales.findById(id)
        if (!validUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isBlocked = validUser.isBlocked;
        const updateStatus = await retailerSales.updateOne(
            { _id: id },
            { $set: { isBlocked: !isBlocked } }
        )

        if (!updateStatus) {
            return res.status(500).json({ success: false, message: 'Error while blocking' })
        }
        if (updateStatus) {
            console.log('updated', updateStatus);
        }
        const salesExeclist = await retailerSales.find({retailerAdminId:adminId})
        return res.status(200).json({ success: true, message: 'User blocked/unblocked successfully', userlist: salesExeclist })

    } catch (error) {
        console.log('error in blocking sales exec', error);
        res.status(500).json({ success: false, message: 'error while blocking user' })
    }
}

export const profile = async (req: CustomRequest, res: Response) => {
    const userRole = req.role;
    const userId = req.id;
    console.log('coming here');
    try {
        const verifyUser = await retailerAdmin.findById(userId)
        if (!verifyUser) {
            return res.status(401).json({ success: false, message: 'UnAuthorized user' })
        }

        res.status(200).json({ success: true, message: 'user details fetched successfully', userDetails: verifyUser })
    } catch (error) {
        console.log('error at get profile');
        res.status(500).json({ success: false, message: 'Error while fetchin profile' })
    }
}

export const connectedProd = async (req: CustomRequest, res: Response) => {
    const id = req.id;
    try {
        const connected = await retailerAdmin.findOne(
            { _id: id }
        ).populate('connectedProduction'); // Corrected: Use the string 'connectedProduction'

        const availableProduction = connected?.connectedProduction
        return res.status(200).json({ success: true, message: 'user list fetched successfully', availableProduction })
    } catch (error) {
        console.log('error while getting connected production', error)
        res.status(500)
    }
}




export const avialableProd = async (req: CustomRequest, res: Response) => {
    const id = req?.id

    try {
        const retailer = await retailerAdmin.findById(id);

        const connectedProd = retailer?.connectedProduction;

        const availableProduction = await productionAdmin.find({
            isBlocked: false,
            isVerified: true,
            _id: { $nin: connectedProd }
        });

        // console.log(availableProduction);
        return res.status(200).json({ success: true, message: 'fetched available production units', availableProduction })


    } catch (error) {
        console.log('Error while fetching available production list profile', error);
        return res.status(500).json({ success: false, message: 'Error while fetching available production list profile' })
    }
}

export const showProductionprofile = async (req: Request, res: Response) => {
    const { id } = req.query

    try {
        const isvalidUser = await productionAdmin.findById(id)

        if (!isvalidUser) {
            return res.status(401).json({ success: false, message: 'Unauthorized user' })
        }
        if (isvalidUser.isBlocked || !isvalidUser.isVerified) {
            return res.status(403).json({ success: false, message: 'User is blocked' })
        }
        // Calculate the average rating
        const averageRating = await reviews.aggregate([
            {
                $match: {
                    'reviewee.id': mongoose.Types.ObjectId.createFromHexString(id as string),
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
        return res.status(200).json({ success: true, message: 'user details fetched successfully', userDetails: isvalidUser, rating: averageToFive })
    } catch (error) {
        console.log('error at showproductionprofile', error);
        return res.status(500).json({ success: false, message: 'error file fetching profile details' })
    }
}

export const sendConnectionRequest = async (req: CustomRequest, res: Response) => {
    const id = req.id;
    const prodId = req.body.prodId;
    try {
        const verifyRetailerSubscription = await retailerAdmin.findById(id)
        if (verifyRetailerSubscription?.subscribed.active == undefined || verifyRetailerSubscription?.subscribed.active == false) {
            if (verifyRetailerSubscription?.connectedProduction && verifyRetailerSubscription.connectedProduction.length >= 1) {
                // Return or perform your desired action here
                return res.status(200).json({ success: false, message: 'not_subscribed' })
            }
        }
        const validProduction = await productionAdmin.findById(prodId);
        if (validProduction?.isBlocked || !validProduction?.isVerified) {
            return res.status(403).json({ success: false, message: 'User is blocked' });
        }
        const checkReq = await productionAdmin.findOne(
            {
                $and: [
                    { _id: prodId },
                    { requestedRetailer: { $in: [id] } }
                ]
            }
        )
        // console.log('check if already requested', checkReq)
        if (checkReq) {
            return res.status(200).json({ success: true, message: 'already requested' })
        } else {
            // const addReqRet = await retailerAdmin.findByIdAndUpdate(id, { $push: { requestedProduction: prodId } }, { new: true });
            // console.log('mongo update', addReqRet);
            const addReqProd = await productionAdmin.findByIdAndUpdate(prodId, { $push: { requestedRetailer: id } }, { new: true })
            // if (addReqRet && addReqProd) {
            if (addReqProd) {
                return res.status(200).json({ success: true, message: 'requested' });
            } else {
                return res.status(404).json({ success: false, message: 'Retailer not found' });
            }
        }

    } catch (error) {
        console.error('Error processing connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// export const getOrder = async (req: Request, res: Response) => {
//     const retailerId = req.query.id;
//     try {
//         const countOrder = await order.countDocuments({ retailerId })

//         const orders = await order.find({ retailerId }).populate('salesExecId').populate('productionId')

//         res.status(200).json({ success: true, orders, countOrder });
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };

export const getOrder = async (req: CustomRequest, res: Response) => {
    const retailerId = req.id
    const pageSize: number = 6;
    try {
        const { page = 1 } = req.query as { page?: number }

        const countOrder = await order.countDocuments({ retailerId })
        const totalPages = Math.ceil(countOrder / pageSize);

        const orders = await order.find({ retailerId })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .populate('salesExecId')
            .populate('productionId')

        res.status(200).json({ success: true, orders, countOrder, totalPages });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export const addSubscription = async (req: Request, res: Response) => {
    const { planId, id } = req.query

    try {
        const fetchplan = await subscriptionPlans.findById(planId)
        const timeDuration = fetchplan?.duration
        const currentDate = new Date();
        let endDate = new Date(currentDate);
        let duration = ''
        if (timeDuration == '6') {
            duration = 'six'
            endDate.setDate(currentDate.getDate() + 180); // 180 days from now
        } else if (timeDuration == '3') {
            duration = 'three'
            endDate.setDate(currentDate.getDate() + 90);
        }

        const subscription = await retailerAdmin.findByIdAndUpdate(
            id,
            {
                $set: {
                    subscribed: {
                        endDate: endDate,
                        active: true,
                        duration,
                    }
                }
            }, { new: true }

        )

        const newPayment = new payment({
            userId: id,
            amount: fetchplan?.amount,
            role: 'RetailerAdmin',
            period: duration

        })
        await newPayment.save()
        res.status(200).json({ success: true, subscription })
    } catch (error) {
        console.log('error while updating subscription', error)
        res.status(500)
    }
}

export const getReport = async (req: Request, res: Response) => {
    let userId = req.query.id?.toString();
    try {
        const verifyRetailer = await retailerAdmin.findById(userId)
        if (!verifyRetailer) {
            return res.status(403).json({ success: false, message: 'user not found' })
        }

        const orders = await order.aggregate([
            {
                $match: { retailerId: new mongoose.Types.ObjectId(userId) } // Filter orders for the given retailerId
            },
            {
                $group: {
                    _id: '$salesExecId',
                    totalOrders: { $sum: 1 } // Count the number of orders for each salesExecId
                }
            }
        ]);
        const populatedOrders = await order.populate(orders, { path: '_id', model: 'RetailerSales' });
        const responseData = populatedOrders.map((order: any) => ({
            retailerName: order._id.username,
            totalOrders: order.totalOrders
        }));


        const orderToProd = await order.aggregate([
            {
                $match: { retailerId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: '$productionId',
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const populatedOrdersToProd = await order.populate(orderToProd, { path: '_id', model: 'ProductionAdmin' });
        const responseDataToProd = populatedOrdersToProd.map((order: any) => ({
            productionName: order._id.productionName,
            totalOrders: order.totalOrders
        }));

        res.status(200).json({ success: true, message: 'Orders fetched successfully', orders: responseData, ordersToProd: responseDataToProd });
    } catch (error) {
        console.log('error while fetching reports', error)
        res.status(500)
    }
}


export const fetchRetailPlans = async (req: Request, res: Response) => {
    try {
        const fetch = await subscriptionPlans.find({ role: 'retailer', active: true })
        console.log(fetch);
        res.status(200).json({ success: true, fetch })
    } catch (error) {
        console.log('error while fetching subscription plans');
        res.status(500)
    }
}