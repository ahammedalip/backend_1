import express from 'express'
import { createCheckout, createCheckoutOne } from '../../controllers/stripeController'

const router =express.Router()

router.post('/create-checkout-session-six',createCheckout )
router.post('/create-checkout-session-one',createCheckoutOne )


export default router