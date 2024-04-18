import express from 'express'
import {blockUser, createPlan, fetchPlans, getProductionList, getReport, getRetailerList, getRevenue, handleActivation, login, miniReport} from '../controllers/SuperAdmin/superAdmin'
import { verifyAdmin } from '../utils/verifyUser'


const router = express.Router()


router.post('/Admin-auth', login)

router.get('/retailer_list', verifyAdmin,getRetailerList )
router.get('/production_list',verifyAdmin, getProductionList)
router.put('/toggle_block_update',verifyAdmin, blockUser)
router.get('/mini-report', verifyAdmin, miniReport)
router.get('/revenue',verifyAdmin,getRevenue)
router.get('/report', verifyAdmin, getReport)
router.post('/create-plan', verifyAdmin,createPlan )
router.get('/fetch-plan', verifyAdmin, fetchPlans)
router.post('/update-plan-status', verifyAdmin, handleActivation)





export default router;