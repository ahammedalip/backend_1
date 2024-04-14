import express from 'express'
import { verifyProduction } from '../../utils/verifyUser';
import {
    acceptReq, addItem, addSubscription, availableSales, fetchRequestedRetailers,
    getAvailRetailList, getConnRetailersList, getProfile, getReports, getRetailerProfile, getSalesProfile,
    rejectReq, searchRetailer, sendConnectionRequest,
    sortRetailer
} from '../../controllers/ProductionController/ProductionController';
import { acceptOrder, countOrder, fetchOrdersAll, rejectOrder } from '../../controllers/ProductionController/fetchOrder';




const router = express.Router();


router.get('/profile', verifyProduction, getProfile)
router.post('/addItem', verifyProduction, addItem)
router.get('/requests', verifyProduction, fetchRequestedRetailers)
router.delete('/delete-req', verifyProduction, rejectReq)
router.post('/acc-req', verifyProduction, acceptReq)
router.get('/orders', verifyProduction, fetchOrdersAll)
router.get('/order-count', verifyProduction, countOrder)
router.patch('/order-acc', verifyProduction, acceptOrder)
router.patch('/order-rej', verifyProduction, rejectOrder)
router.get('/available-sales', verifyProduction, availableSales)
router.post('/sales-prof', verifyProduction, getSalesProfile)
router.get('/conn-ret', verifyProduction, getConnRetailersList)
router.get('/avail-ret', verifyProduction, getAvailRetailList)
router.get('/ret-profile', verifyProduction, getRetailerProfile)
router.patch('/conn-req', verifyProduction, sendConnectionRequest)
router.patch('/subscription', verifyProduction, addSubscription)
router.get('/search-user', verifyProduction, searchRetailer)
router.get('/retailer-sort', verifyProduction, sortRetailer)
router.get('/report', verifyProduction,getReports)

export default router;