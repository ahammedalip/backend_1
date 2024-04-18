import { NextFunction, Request, Response } from 'express';
import { errorhandler } from "../../utils/errorhandler";
import jwt from 'jsonwebtoken'
import productionAdmin from "../../models/ProductionAdmin";
import payment from "../../models/Payments";
import { superAdmin } from '../../models/SuperAdmin';
import { retailerAdmin } from '../../models/RetailerAdmin';
import { subscriptionPlans } from '../../models/SubscriptionPlans';

interface SuperAdmin {
    username: string;
    password: string;

}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password: reqPassword } = req.body;

    try {
        const validUser = await superAdmin.findOne({ username })
        console.log('user found', validUser)
        if (!validUser) {
            // If user is not found, call the error handler and pass the error to next
            const error = errorhandler(401, "User not found");
            return res.status(error.StatusCode).json({ success: false, message: error.message });
        }
        if (validUser && validUser.password && validUser.password !== reqPassword) {
            const error = errorhandler(401, "Wrong credentials");
            return res.status(error.StatusCode).json({ success: false, message: error.message });
        }
        validUser.password = "";

        const token = jwt.sign({ id: validUser._id.toString(), role: 'SuperAdmin' }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

        const expiry: Date = new Date(Date.now() + 3600000)
        res.cookie('admin_token', token, { expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'user validated' });
    }
    catch (err) {
        console.log('Error at superAdmin signup', err);

        const error = errorhandler(500, "Internal Server Error");
        res.status(error.StatusCode).json({ success: false, message: error.message });
    }
}


export const getRetailerList = async (req: Request, res: Response) => {

    const pageSize: number = 10;

    try {
        const { page = 1 } = req.query as { page?: number }


        const countRetailList = await retailerAdmin.countDocuments({ isVerified: true })
        const totalPages = Math.ceil(countRetailList / pageSize)

        const retailersList = await retailerAdmin.find({ isVerified: true })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
        res.status(200).json({ success: true, message: 'Retailer list fetched successfully', userlist: retailersList, countRetailList, totalPages })
    } catch (error) {
        console.log('error at fetching retailer list', error);
        res.status(500).json({ success: false, message: 'Error at fetching retailer list' })
    }
}

export const getProductionList = async (req: Request, res: Response) => {
    const pageSize: number = 10;

    try {
        const { page = 1 } = req.query as { page?: number }

        const countProductionList = await productionAdmin.countDocuments({ isVerified: true })
        const totalPages = Math.ceil(countProductionList / pageSize)

        const productionList = await productionAdmin.find({ isVerified: true })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
        res.status(200).json({ success: true, message: 'Production list fetched successfully', userlist: productionList, countProductionList, totalPages, })
    } catch (error) {
        console.log('Error at fetching production list=>', error);
        res.status(500).json({ success: false, message: 'Error at fetching production list' })
    }
}

export const blockUser = async (req: Request, res: Response) => {
    const { role, id } = req.query
    console.log(role, id);
    console.log('cp,omm');
    if (role == 'production') {
        try {
            const validUser = await productionAdmin.findById(id)
            if (!validUser) {
                return res.status(404).json({ success: false, message: 'User not found' })
            }
            const isBlocked = validUser.isBlocked;

            const updateStatus = await productionAdmin.updateOne(
                { _id: id },
                { $set: { isBlocked: !isBlocked } })
            if (!updateStatus) {
                return res.status(500).json({ success: false, message: 'Error while blocking' })
            }
            const productionList = await productionAdmin.find({ isVerified: true })
            return res.status(200).json({ success: true, message: 'User blocked successfully', userlist: productionList })
        } catch (error) {
            console.log('error at block production or retailer user -->', error);
            res.status(500).json({ success: true, message: 'Error at Blocking user' })
        }
    } else if (role == 'retailer') {
        try {
            const validUser = await retailerAdmin.findById(id)
            if (!validUser) {
                return res.status(404).json({ success: false, message: 'User not found' })
            }
            const isBlocked = validUser.isBlocked;

            const updateStatus = await retailerAdmin.updateOne(
                { _id: id },
                { $set: { isBlocked: !isBlocked } })
            if (!updateStatus) {
                return res.status(500).json({ success: false, message: 'Error while blocking' })
            }
            const productionList = await retailerAdmin.find({ isVerified: true })
            return res.status(200).json({ success: true, message: 'User blocked successfully', userlist: productionList })
        } catch (error) {
            console.log('error at block production or retailer user -->', error);
            res.status(500).json({ success: true, message: 'Error at Blocking user' })
        }
    }
}

export const getRevenue = async (req: Request, res: Response) => {
    const pageSize: number = 10;
    try {
        const { page = 1 } = req.query as { page?: number }

        const totalPaymentDoc = await payment.countDocuments()

        const totalPages = Math.ceil(totalPaymentDoc / pageSize)

        const getRevenue = await payment.find()
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .populate('userId')
        // console.log('get revenue', getRevenue)

        const totalPayment = await payment.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ])
        const totalAmount = totalPayment[0].totalAmount
        // console.log('total amount', totalPayment[0].totalAmount)
        res.status(200).json({ success: true, revenueList: getRevenue, totalAmount, totalPaymentDoc, totalPages })
    } catch (error) {
        console.log('error at get revenue', error)
        res.status(500)
    }

}

export const miniReport = async (req: Request, res: Response) => {
    try {
        const countRetailer = await retailerAdmin.countDocuments({
            isBlocked: false,
            isVerified: true
        })
        const countProduction = await productionAdmin.countDocuments({
            isBlocked: false,
            isVerified: true,
        })

        const totalPayment = await payment.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ])
        const totalAmount = totalPayment[0].totalAmount

        res.status(200).json({ success: true, countRetailer, countProduction, totalAmount })
    } catch (error) {
        console.log('error while fetching miniReport', error);
        res.status(500)
    }
}

export const getReport = async (req: Request, res: Response) => {
    try {
        const currentYear = new Date().getFullYear();

        // Query MongoDB to fetch the revenue data for each month of the current year
        const revenueData = await payment.aggregate([
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
        const formattedRevenueData = revenueData.map(item => ({
            ...item,
            month: monthNames[item.month]
        }));
        console.log(formattedRevenueData)
        res.status(200).json({success:true, revenueData})
    } catch (error) {
        console.log('error while getting report >>', error)
        res.status(500)
    }
}



export const createPlan = async (req: Request, res: Response) => {
    const { role, name, features, amount, duration } = req.body
    try {
        const plan = new subscriptionPlans({
            role,
            name,
            features,
            duration,
            amount

        })
        await plan.save()
        res.status(200).json({ success: true })
    } catch (error) {
        console.log('error while creating new plan')
        res.status(500)
    }

}

export const fetchPlans = async (req: Request, res: Response) => {
    try {
        const plans = await subscriptionPlans.find()
        console.log('plans-----', plans);
        res.status(200).json({ success: true, plans })
    } catch (error) {
        console.log('error while fetching plans')
        res.status(500)
    }
}

export const handleActivation = async (req: Request, res: Response) => {
    console.log(req.body);
    console.log(req.body.active, req.body.planId)
    try {
        const updatedPlan = await subscriptionPlans.findOneAndUpdate(
            { _id: req.body.planId }, 
            { active: req.body.active }, 
            { new: true } 
        );

        if (!updatedPlan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        return res.status(200).json({ success: true, updatedPlan });
    } catch (error) {
        console.log('error while handling activation', error)
        res.status(500)
    }
}