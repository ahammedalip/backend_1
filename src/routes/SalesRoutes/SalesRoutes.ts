import express from 'express'
import { checkSubscription, createOrder, deleteOrder, editOrder, editOrderRequest, fetchOrder, getAvailableProduction, getReport, productionProfile, viewIndividualprofile } from '../../controllers/SalesController/SalesController';
import { verifySales } from '../../utils/verifyUser';


const router = express.Router()


router.get('/available-prod',verifySales, getAvailableProduction)
router.get('/prod/profile', verifySales, viewIndividualprofile)
router.post('/createOrder', verifySales, createOrder)
router.get('/orders', verifySales, fetchOrder)
router.patch('/edit-req', verifySales, editOrderRequest)
router.patch('/edit-order', verifySales,editOrder )
router.delete('/deleteOrder', verifySales,deleteOrder)
router.post('/prod-profile',verifySales,productionProfile)
router.get('/checkSubscription', verifySales, checkSubscription)
router.get('/report', verifySales,getReport)


export default router;