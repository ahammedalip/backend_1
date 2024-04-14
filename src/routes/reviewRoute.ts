import express from 'express'
import { submitReview } from '../controllers/reviewController';

const router =express.Router()

router.post('/submit', submitReview)

export default router;