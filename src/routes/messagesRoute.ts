import express from 'express';
import { addMessage, getMessage } from '../controllers/messagesController';

const router = express.Router()

router.post ('/',addMessage)
router.get ('/', getMessage)


export default router;