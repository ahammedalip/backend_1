import { Request, Response } from 'express'
import bcryptjs from 'bcryptjs'
import productionAdmin from '../../models/ProductionAdmin'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'


export const productionValidation = async (req: Request, res: Response) => {
    const { productionName, email, password } = req.body
    console.log(req.body)
    try {
        const existingProduction = await productionAdmin.findOne({ productionName })
        const existingEmail = await productionAdmin.findOne({ email });

        if (existingProduction) {
           return res.status(400).json({ success: false, message: "Name already exists!" });
        }
        if (existingEmail) {
          return  res.status(400).json({ success: false, message: 'Email already exists' })
        }
        const generatedOTP: number = Math.floor(100000 + Math.random() * 900000)
        const hashedPass: string = bcryptjs.hashSync(password, 2)
        const newProduction = new productionAdmin({
            productionName,
            email,
            password: hashedPass,
            otpCode: generatedOTP
        })
        await newProduction.save();
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
    } catch (err: any) {
        console.log('error at Production signup', err)
        if (err.code === 11000) {
            const keyValue = err.keyValue
            // console.log(err.keyValue);
            res.status(409).json({ success: false, message: `${keyValue} already exists` })
        }

    }

}

export const otpVerification = async (req: Request, res: Response) => {
    const { data, email } = req.body
    const { otp } = data


    try {
        const verifyEmail = await productionAdmin.findOne({ email });
        const verifyOTP = verifyEmail?.otpCode == otp;
        if (!verifyEmail || !verifyOTP) {
            return res.status(401).json({ success: false, message: 'OTP entered is incorrect. Please try again.' })
        }
        if (verifyOTP) {
            const updated = await productionAdmin.updateOne(
                { email }, { $set: { isVerified: true } }
            );
            console.log(updated);
            return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
        }
    } catch (error) {
        console.error("Error at otp verification", error);
        return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

export const login = async (req: Request, res: Response) => {
    const { productionName, password } = req.body;

    try {
        const validUser = await productionAdmin.findOne({ productionName })

        if (!validUser) {
           return res.status(401).json({ success: false, message: 'Enter valid credentials' })
        }

        const verifyPass = bcryptjs.compareSync(password, validUser.password)
        if (!verifyPass) {
           return  res.status(401).json({ success: false, message: 'Password is wrong' })
        }
        validUser.password = '';

        const token = jwt.sign({ id: validUser?._id.toString(), role: 'productionAdmin' }, process.env.JWT_SECRET || '', { expiresIn: '1h' })
        const expiry: Date = new Date(Date.now() + 3600000)
        res.cookie('production_token', token, { httpOnly: true, expires: expiry, secure: false }).status(200).json({ user: validUser, token, success: true, message: 'User validated' });

    } catch (error) {
        console.log('Error at productionAdmin login', error);
        res.status(500).json({ success: false, message: 'Internal server Error' })
    }
}


