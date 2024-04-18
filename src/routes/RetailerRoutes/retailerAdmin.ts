import  express from "express";
import {  addSalesExecutive, addSubscription, avialableProd, blockSalesExec, connectedProd, fetchRetailPlans, getOrder, getReport, getSalesList, profile, sendConnectionRequest, showProductionprofile } from "../../controllers/RetailerController/retailerAdmin";
import { verifyRetailer } from "../../utils/verifyUser";


const router = express.Router()



router.post('/add_sales', verifyRetailer,addSalesExecutive)
router.get('/sales_list',getSalesList)
router.put('/toggle_block_update', verifyRetailer,blockSalesExec)
router.get('/available', verifyRetailer,avialableProd)
router.get('/profile', verifyRetailer, profile)
router.get('/prod/profile' , verifyRetailer,showProductionprofile)
router.post('/conn-req', verifyRetailer,sendConnectionRequest)
router.get('/connected', verifyRetailer, connectedProd)
router.get('/getOrder', verifyRetailer,getOrder)
router.patch('/subscription', verifyRetailer, addSubscription)
router.get('/reports', verifyRetailer, getReport)
router.get('/fetch-plans', verifyRetailer,fetchRetailPlans)


export default router;