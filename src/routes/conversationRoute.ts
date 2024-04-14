import express from 'express'
import { conversation, getConversation } from '../controllers/conversationController';
import { verifySender } from '../utils/verifyUser';

const router = express.Router()


router.post('/',conversation)
router.get('/:userId',getConversation)



// router.post('/pro',verifySender, sendMessageProduction)
// router.post('/sal', verifySender, sendMessageSales)
// router.post('/get-prod',verifySender, getMessageProd)
// router.post( '/get-sale', verifySender,getMessageSales)


export default router;