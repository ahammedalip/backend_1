import express from "express";
import { login, otpVerification, productionValidation, resendOTP } from "../../controllers/ProductionController/AdminAuth";
import { verifyProduction } from "../../utils/verifyUser";


const router = express.Router()


router.post('/verify_cred',productionValidation)
router.post ('/verify_otp', otpVerification)
router.post('/resend-otp', resendOTP)
router.post ('/login', login)


export default router;