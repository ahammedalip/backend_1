import { NextFunction, Request, Response } from "express"
import session from 'express-session'
import bcryptjs from 'bcryptjs'
import nodemailer from 'nodemailer'
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import retailerSales from "../../models/RetailerSales";
import { retailerAdmin } from "../../models/RetailerAdmin";



export const retailValidation = async (req: Request, res: Response, next: NextFunction) => {
    const { retailerName, email, password, } = req.body
    console.log(req.body);
    try {
        const existingRetailer = await retailerAdmin.findOne({ retailerName })
        const existingEmail = await retailerAdmin.findOne({ email })
        if (existingRetailer) {
           return res.status(400).json({ success: false, message: 'Retailer name already exists' })
        }
        if (existingEmail) {
           return res.status(400).json({ success: false, message: 'Email already exists' })
        }
        const generatedOTP: number = Math.floor(100000 + Math.random() * 900000);

        const hashedPass: string = bcryptjs.hashSync(password, 2);
        const newRetailer = new retailerAdmin({
            retailerName,
            email,
            password: hashedPass,
            otpCode: generatedOTP
        })

        await newRetailer.save()

        console.log('generated OTP is ', generatedOTP);
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ahmd.work12@gmail.com',
                pass: 'awbs lrfg gwgv zqvg'
            }
        })


        const mailOptions = {
            from: 'ahmd.work12@gmail.com',
            to: req.body.email, // User's email
            subject: 'OTP Verification',
            text: `Your OTP for verification of Scale.b is  : ${generatedOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.scale.b.online`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ success: false, message: "Error at sending mail" })
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(250).json({ success: true, message: 'OTP send succesfully' })
            }
        });
    } catch (err: any) {
        console.log('error at retailer signup', err)
        if (err.code === 11000) {
            const keyValue = err.keyValue
            // console.log(err.keyValue);
            res.status(409).json({ success: false, message: `${keyValue} already exists` })
        }
    }
}

export const resendOTP = async(req:Request, res:Response)=>{
    // console.log('just coming here')
    console.log('req.body', req.body.email)
    try {
        const generatedOTP: number = Math.floor(100000 + Math.random() * 900000)
        const fetchUser = await retailerAdmin.findOneAndUpdate(
            {email: req.body.email},
            {otpCode:generatedOTP},
            {new:true}
        )
        console.log('Generated otp is ', generatedOTP);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ahmd.work12@gmail.com',
                pass: 'awbs lrfg gwgv zqvg'
            }
        })

        const mailOptions = {
            from: 'ahmd.work12@gmail.com',
            to: req.body.email, // User's email
            subject: 'OTP Verification',
            text: `Your OTP for verification of Producton unit registration of Scale.b is  : ${generatedOTP}. 
            Do not share the OTP with anyone.
            For further details and complaints visit www.scale.b.online`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
               return  res.status(400).json({ success: false, message: "Error at sending mail" })
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(250).json({ success: true, message: 'OTP send succesfully' })
            }
        });

    } catch (error) {
        console.log('error while resending otp', error)
        res.status(500).json({success:false, message:'Error while resending otp'})
    }
   
}

export const otpVerification = async (req: Request, res: Response) => {
    const { formData, otp } = req.body;
    const { retailerName, email, password } = formData;

    try {
        const verifyEmail = await retailerAdmin.findOne({ email: email });
        const verifyOTP = verifyEmail?.otpCode == otp
        if (!verifyOTP || !verifyEmail) {
            return res.status(401).json({ success: false, message: 'OTP entered is incorrect. Please try again.' })
        }
        if (verifyOTP) {
            const updated = await retailerAdmin.updateOne(
                { email }, { $set: { isVerified: true } }
            )
            return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
        }
    } catch (error) {
        console.error("Error at otp verification", error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

export const retailLogin = async (req: Request, res: Response) => {
    const { retailerName, password, role } = req.body
    console.log(req.body);
    console.log('coming here');


    if (role == 'retailAdmin') {
        try {
            const validUser = await retailerAdmin.findOne({ retailerName });
            if (!validUser) {
                return res.status(401).json({ success: false, message: 'Enter valid credentials' })
            }
            const hashedPass = bcryptjs.compareSync(password, validUser?.password)

            if (!hashedPass) {
                return res.status(401).json({ success: false, message: 'Password is wrong' })
            }
            if (validUser.isBlocked) {
                return res.status(403).json({ success: false, message: 'User is Blocked' })
            }
            if (!validUser.isVerified) {
                return res.status(403).json({ success: false, message: 'Please Signup again' })
            }

            validUser.password = "";
            const token = jwt.sign({ id: validUser?._id.toString(), role: 'retailerAdmin', validUser: validUser.retailerName }, process.env.JWT_SECRET || '', { expiresIn: '1h' })
            const expiry: Date = new Date(Date.now() + 3600000)
            res.cookie('retailer_token', token, { httpOnly: true, expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'User validated' });
        } catch (error) {
            console.log('Error at retailAdmin login', error);
            return res.status(500).json({ success: false, message: 'Internal server Error' })
        }
    } else if (role == 'salesExecutive') {
        try {
            const validUser = await retailerSales.findOne({ username: retailerName })
            // console.log('alid user', validUser);
            if (!validUser) {
                return res.status(401).json({ success: false, message: 'Enter valid credentials' })
            }
            const hashedPass = bcryptjs.compareSync(password, validUser.password)

            if (!hashedPass) {
                return res.status(401).json({ success: false, message: 'Password is wrong' })
            }
            if (validUser.isBlocked) {
                return res.status(403).json({ success: false, message: 'User is Blocked' })
            }
            validUser.password = "";
            const token = jwt.sign({ id: validUser?._id.toString(), role: 'retailerSales', validUser: validUser.username }, process.env.JWT_SECRET || '', { expiresIn: '1h' })
            const expiry: Date = new Date(Date.now() + 3600000)
            res.cookie('retailerSales_token', token, { httpOnly: true, expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'User validated' });

        } catch (error) {
            console.log('Error at retailAdmin login', error);
            return res.status(500).json({ success: false, message: 'Internal server Error' })
        }
    }
}