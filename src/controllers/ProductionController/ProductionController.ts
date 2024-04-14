import { Request, Response } from 'express'
import productionAdmin from '../../models/ProductionAdmin';
import order from '../../models/Order';
import retailerSales from '../../models/RetailerSales';
import reviews from '../../models/Reviews';
import mongoose, { Document, Schema, model, Types } from 'mongoose';
import cron from 'node-cron';
import payment from '../../models/Payments';
import { CustomRequest } from '../../interfaces/interfaces';
import { retailerAdmin } from '../../models/RetailerAdmin';



// Schedule a job to run every day at 12 pm
cron.schedule('0 12 * * *', async () => {
    const currentDate = new Date();
    await productionAdmin.updateMany(
        { 'subscribed.endDate': { $lt: currentDate } },
        { $set: { 'subscribed.$.active': false } }
    );
    console.log('Subscription status updated.');
});


export const getProfile = async (req: CustomRequest, res: Response) => {

    const userRole = req.role;
    const userId = req.id;
    const id = req.query.id
    try {
        const verifyUser = await productionAdmin.findById(userId)
        if (!verifyUser) {
            return res.status(401).json({ success: false, message: 'UnAuthorized user' })
        }
        // console.log(verifyUser);
        res.status(200).json({ success: true, message: 'user details fetched successfully', userDetails: verifyUser })
    } catch (error) {
        console.log('error at fetching profile', error);
        return res.status(500).json({ success: false, message: 'Error while fetching profile' })

    }

}

export const addItem = async (req: CustomRequest, res: Response) => {
    const userId = req.id;
    const { name } = req.body

    try {
        const verifyUser = await productionAdmin.findById(userId)
        if (!verifyUser) {
            return res.status(401).json({ success: false, message: 'Unauthorized user' })
        }
        const updateResult = await productionAdmin.updateOne(
            { _id: userId },
            { $push: { availableItems: name } }
        )

        if (updateResult.acknowledged == false) {
            return res.status(400).json({ success: false, message: 'Failed to add item' });
        }

        const updatedUser = await productionAdmin.findById(userId);

        return res.json({ success: true, userDetails: updatedUser });

    } catch (error) {
        console.log('error at adding item ', error);
        return res.status(500).json({ success: false, message: 'Error while adding item' })
    }

}

export const fetchRequestedRetailers = async (req: CustomRequest, res: Response) => {
    const id = req.id;

    try {
        const fetchUser = await productionAdmin.findById(id).populate('requestedRetailer');

        const notBlockedRetailers: any = fetchUser?.requestedRetailer.filter((retailer:any) => !retailer.isBlocked);

        if (notBlockedRetailers.length > 0) {
            // console.log('Some requested retailers are :', notBlockedRetailers);
            // Handle the case where some retailers are blocked
        } else {
            // console.log('No requested retailers are blocked.');
            // Handle the case where no retailers are blocked
        }
        return res.status(200).json({ success: true, message: 'fetched users', userDetails: notBlockedRetailers })
    } catch (error) {
        console.log('error at fetchReequestedRetailer', error)
        res.status(500)
    }
}

export const acceptReq = async (req: CustomRequest, res: Response) => {
    const id = req.id;
    const retailId = req.body.id


    try {
        const verifyProduction = await productionAdmin.findById(id)

        if (verifyProduction?.isBlocked) {
            return res.status(403).json({ success: false, message: "unauthorized user" })
        }
        const checkConnectionProd = await productionAdmin.findOne(
            {
                $and: [
                    { _id: id },
                    { connectedRetailer: { $in: [retailId] } }
                ]
            }
        )

        const checkConnectionRet = await retailerAdmin.findOne(
            {
                $and: [
                    { _id: retailId },
                    { connectedProduction: { $in: [id] } }
                ]
            }
        )

        if (checkConnectionProd || checkConnectionRet) {

            await productionAdmin.findByIdAndUpdate(
                id,
                { $pull: { requestedRetailer: retailId } },
                { new: true }
            );

            return res.status(200).json({ success: true, message: 'already connected' })
        } else {
            const updateProd = await productionAdmin.findByIdAndUpdate(
                id,
                { $push: { connectedRetailer: retailId } },
                { new: true });

            const updateRet = await retailerAdmin.findByIdAndUpdate(
                retailId,
                { $push: { connectedProduction: id } },
                { new: true }
            )

            await productionAdmin.findByIdAndUpdate(
                id,
                { $pull: { requestedRetailer: retailId } },
                { new: true }
            );


            return res.status(200).json({ success: true, message: 'User connected' })
        }


    } catch (error) {
        console.error('Error processing connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const rejectReq = async (req: CustomRequest, res: Response) => {
    const id = req.id
    const retailerId = req.query.id

    console.log('profile id is========', retailerId)
    try {

        const deleteReq = await productionAdmin.findByIdAndUpdate(
            id,
            { $pull: { requestedRetailer: retailerId } },
            { new: true }
        );

        res.status(200).json({ success: true, message: 'Connection Request rejected' })

    } catch (error) {
        console.error('Error rejecting connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export const availableSales = async (req: CustomRequest, res: Response) => {
    const id = req.id;

    try {
        const productionAdminDoc = await productionAdmin.findById(id).populate('connectedRetailer')

        const connectedRetailerId = productionAdminDoc?.connectedRetailer.map((retailer: any) => retailer._id);
        const salesExecutive = await retailerSales.find({
            retailerAdminId: { $in: connectedRetailerId },
            isBlocked: false
        })
        return res.status(200).json({ success: true, message: 'Sales executives list fetched successfully', salesExecutive })
    } catch (error) {
        console.log('Error at fetching sales executives', error);
        return res.status(500).json({ success: false, message: 'Error at fetching sales executives' })
    }
}


export const getSalesProfile = async (req: Request, res: Response) => {
    const salesId = req.body.salesId

    try {
        const salesExecutive = await retailerSales.findById(salesId);

        if (salesExecutive?.isBlocked) {
            return res.status(403).json({ success: false, message: 'user is blocked' })
        }
        res.status(200).json({ success: true, salesExecutive })
    } catch (error) {
        console.log('Error at fetching sales executives', error);
        return res.status(500).json({ success: false, message: 'Error at fetching sales executives' })
    }
}


export const getConnRetailersList = async (req: CustomRequest, res: Response) => {
    const id = req.id
    console.log(req.query, 'in  connected')
    const { search, sort } = req.query
    console.log(search, sort);
    if (typeof search !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Invalid search value",
        });
    }
    try {
        let query: any = { isBlocked: false, isVerified: true };

        if (search) {
            query.retailerName = { $regex: new RegExp(search, 'i') };
        }

        const connectedRetailer = await productionAdmin.findById(id).populate('connectedRetailer');
        let connected = connectedRetailer?.connectedRetailer;
        if (search && connected) {
            connected = connected.filter((retailer: any) => retailer.retailerName.match(new RegExp(search, 'i')));
        }

        if (sort && sort === '1') {
            connected = connected?.sort((a: any, b: any) => {
                const nameA = a.retailerName?.toUpperCase();
                const nameB = b.retailerName?.toUpperCase();
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

    } catch (error) {
        console.log('Error while fetching connected retailers', error);
        return res.status(500).json({ success: false, message: 'Error at  while fetching connected retailers' })
    }
}

export const getAvailRetailList = async (req: CustomRequest, res: Response) => {
    const id = req.id
    console.log('in avialable', req.query);

    const pageSize: number = 6;
    try {
        const { page = 1 } = req.query as { page?: number }

        const production = await productionAdmin.findById(id);

        const connectedRetailer = production?.connectedRetailer;
        const availableRetailerCount = await retailerAdmin.countDocuments({
            isBlocked: false,
            isVerified: true,
            _id: { $nin: connectedRetailer }
        })
        const totalPages = Math.ceil(availableRetailerCount / pageSize)

        // console.log('count of available retailers list,--------',availableRetailerCount)
        const availableRetailer = await retailerAdmin.find({
            isBlocked: false,
            isVerified: true,
            _id: { $nin: connectedRetailer }
        }).skip((page - 1) * pageSize)
            .limit(Number(pageSize));
        // console.log('available retailer', availableRetailer)

        res.status(200).json({ success: true, availableRetailer, availableRetailerCount, totalPages })
    } catch (error) {
        console.log('error while fetching available retailers', error)
        res.status(500).json({ success: false, message: 'Error while fetching available retailers' })
    }
}


export const searchRetailer = async (req: Request, res: Response) => {

    const searchVal = req.query.value
    if (typeof searchVal !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Invalid search value",
        });
    }

    try {
        const searchPattern = new RegExp(searchVal, 'i');

        // Use the $regex operator to find retailers whose name matches the pattern
        const searchRetailer = await retailerAdmin.find({
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
        } else {
            res.status(200).json({
                success: true,
                message: "No retailers found matching the search criteria",
                retailers: []
            });
        }
    } catch (error) {
        console.log('error while searching data', error)
        res.status(500)
    }
}

export const sortRetailer = async (req: Request, res: Response) => {
    const value = req.query.value
    console.log('sort value', value)
    try {
        const sortOrder = value === '1' ? 1 : -1;

        const retailerRatings = await reviews.aggregate([
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
            await retailerAdmin.updateOne({ _id: rating._id }, { averageRating: rating.averageRating });
        }

        const sortedRetailers = await retailerAdmin.find({ isBlocked: false, isVerified: true }).sort({ averageRating: sortOrder });

        console.log('sorted retailers', sortedRetailers);
        res.status(200).json({ sortedRetailers, success: true })
    } catch (error) {
        console.log('error while sorting', error);
        res.status(500)
    }
}


export const getRetailerProfile = async (req: Request, res: Response) => {
    const id = req.query.id
    try {
        const retailerProfile = await retailerAdmin.findById(id)
        if (retailerProfile?.isBlocked) {
            return res.status(403).json({ success: false, message: 'user is blocked' })
        }
        // Calculate the average rating
        const averageRating = await reviews.aggregate([
            {
                $match: {
                    'reviewee.id': mongoose.Types.ObjectId.createFromHexString(id as string),
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

        let averageToFive = 0

        if (averageRating.length > 0) {
            averageToFive = Math.ceil((averageRating[0].averageRating / 2) * 2) / 2;
        }

        // console.log('average to 555', averageToFive)

        res.status(200).json({ success: true, retailerProfile, message: 'user profile fetched successfully', rating: averageToFive })
    } catch (error) {
        console.log('ERror while fetching retailer individual profile')
        res.status(500).json({ success: false, message: 'error while fetching details' })
    }
}

export const sendConnectionRequest = async (req: Request, res: Response) => {
    // console.log('data from tne sgkdjkd body', req.body)
    const productionId = req.body.productionId
    const retailerId = req.body.retailId

    try {
        const verifyProductionSubscription = await productionAdmin.findById(productionId)
        if (verifyProductionSubscription?.subscribed.active == undefined || verifyProductionSubscription?.subscribed.active == false) {
            if (verifyProductionSubscription?.connectedRetailer && verifyProductionSubscription.connectedRetailer.length >= 1) {
                console.log('the array is greater than 1 and is not premium also so returning')
                return res.status(200).json({ success: false, message: 'not_subscribed' })
            }
        }

        const validRetailer = await retailerAdmin.findById(retailerId)
        if (validRetailer?.isBlocked || !validRetailer?.isVerified) {
            return res.status(403).json({ success: false, message: 'user is blocked' })
        }

        const checkReq = await retailerAdmin.findOne({
            $and: [
                { _id: retailerId },
                { requestedProduction: { $in: [productionId] } }
            ]
        })
        if (checkReq) {
            return res.status(200).json({ success: true, message: 'Already requested' })
        } else {
            // const addReqProd = await productionAdmin.findByIdAndUpdate(productionId, { $push: { requestedRetailer: retailerId } }, { new: true })
            // console.log('add req production');
            const addReqRet = await retailerAdmin.findByIdAndUpdate(retailerId, { $push: { requestedProduction: productionId } }, { new: true })

            if (addReqRet) {
                return res.status(200).json({ success: true, message: 'Request send Successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Retailer not found' });
            }
        }
    } catch (error) {
        console.error('Error processing connection request:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

}

export const addSubscription = async (req: Request, res: Response) => {
    const { time, id } = req.query
    const currentDate = new Date();
    let endDate = new Date(currentDate);
    let duration = ''
    if (time === 'six') {
        duration = 'six'
        endDate.setDate(currentDate.getDate() + 180); // 180 days from now
    } else if (time === 'one') {
        duration = 'one'
        endDate.setDate(currentDate.getDate() + 365); // 365 days from now
    }

    try {

        const subscription = await productionAdmin.findByIdAndUpdate(
            id,
            {
                $set: {
                    subscribed: {
                        endDate: endDate,
                        active: true,
                        duration: time
                    }
                }
            }, { new: true }

        )
        let paidAmount
        if (time == 'six') {
            paidAmount = 249

        } else if (time == 'one') {
            paidAmount = 399
        }
        const newPayment = new payment({
            userId: id,
            amount: paidAmount,
            role: 'ProductionAdmin',
            period: time

        })
        await newPayment.save()

        res.status(200).json({ success: true, subscription })
    } catch (error) {
        console.log('error while updating subscription', error)
        res.status(500)
    }

}

export const getReports = async (req: CustomRequest, res: Response) => {
    const id = req.id
    try {
        const orders = await order.aggregate([
            {
                $match: { productionId: new mongoose.Types.ObjectId(id) }
            },
            {
                $group: {
                    _id: '$retailerId',
                    totalOrders: { $sum: 1 }
                }
            }
        ])
        console.log(orders)
        const populateRetailer = await order.populate(orders, { path: '_id', model: 'RetailerAdmin' })
        const responseData = populateRetailer.map((ord: any) => ({
            retailerName: ord._id.retailerName,
            totalOrders: ord.totalOrders
        }))
        console.log('responsse data', responseData)

        res.status(200).json({ success: true, pieChart: responseData })
    } catch (error) {
        console.log('error while fetching reports', error)
        res.status(500)
    }
}