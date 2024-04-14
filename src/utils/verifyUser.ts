import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import productionAdmin from "../models/ProductionAdmin";
import { CustomRequest } from "../interfaces/interfaces";
import { retailerAdmin } from "../models/RetailerAdmin";



export const verifyRetailer = async (req: CustomRequest, res: Response, next: NextFunction) => {
  // console.log('coming here to verify retailer admin');
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // If no token, return  401 Unauthorized
  }
  try {

    const decoded: any = jwt.decode(token);
    const verifyUser = await retailerAdmin.findById(decoded.id)
    // console.log('decoded token from retailer is->', decoded);

    if (decoded?.role !== 'retailerAdmin') {
      res.status(401).json({ success: false, message: 'Unauthorized user' })
    }

    if (verifyUser?.isBlocked) {
      console.log('user is blocked');
      return res.status(403).json({ success: false, message: "User blocked " })
    }
    req.role = decoded.role;
    req.id = decoded.id

    next()

  } catch (err) {

    console.error(err);
    return res.sendStatus(403); // Forbidden
  }
}

export const verifySales = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // If no token, return  401 Unauthorized
  }

  try {

    const decoded: any = jwt.decode(token);
    const verifyUser = await retailerAdmin.findById(decoded.id)
    // console.log('decoded token from retailer is->', decoded);

    if (decoded?.role !== 'retailerSales') {
      res.status(401).json({ success: false, message: 'Unauthorized user' })
    }

    if (verifyUser?.isBlocked) {
      console.log('user is blocked');
      return res.status(403).json({ success: false, message: "User blocked " })
    }
    req.role = decoded.role;
    req.id = decoded.id

    next()

  } catch (err) {

    console.error(err);
    return res.sendStatus(403); // Forbidden
  }
}

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // If no token, return  401 Unauthorized
  }

  try {

    const decoded: any = jwt.decode(token)
    // console.log('decoded token from verify admin', decoded); // This will log the decoded payload to the console
    if (decoded?.role !== 'SuperAdmin') {
      res.status(401).json({ success: false, message: 'Unauthorized user' })
    }

    return next()

  } catch (err) {
    // Handle the error if the token is not valid
    console.error(err);
    return res.sendStatus(403); // Forbidden
  }

}

export const verifyProduction = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // If no token, return  401 Unauthorized
  }

  try {

    const decoded: any = jwt.decode(token)
    // console.log('decoded token from verify admin', decoded); // This will log the decoded payload to the console

    const verifyUser = await productionAdmin.findById(decoded.id)
    if (decoded?.role !== 'productionAdmin' || !verifyUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized user' })
    }

    if (verifyUser.isBlocked) {
      console.log('user is blocked');
      return res.status(403).json({ success: false, message: "User blocked " })
    }
    req.role = decoded.role;
    req.id = decoded.id
    return next()
  } catch (err) {
    // Handle the error if the token is not valid
    console.error(err);
    return res.sendStatus(403); // Forbidden
  }
}

export const verifySender = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // If no token, return  401 Unauthorized
  }

  try {

    const decoded: any = jwt.decode(token)
    // console.log('decoded token from verify admin', decoded); // This will log the decoded payload to the console

    const verifyUser = await productionAdmin.findById(decoded.id)


    if (verifyUser?.isBlocked) {
      console.log('user is blocked');
      return res.status(403).json({ success: false, message: "User blocked " })
    }
    req.role = decoded.role;
    req.id = decoded.id
    return next()

  } catch (err) {

    console.error(err);
    return res.sendStatus(403); // Forbidden
  }
}