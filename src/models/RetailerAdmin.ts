import mongoose, { Document, Schema, model } from "mongoose";

interface Subscription{
    endDate :Date,
    active: boolean,
    duration: string,
}

interface UserInterface extends Document{
    retailerName: string,
    email : string,
    password: string,
    isBlocked: boolean,
    role: string,
    otpCode: number,
    isVerified: boolean,
    description:string,
    connectedProduction:mongoose.Schema.Types.ObjectId[],
    requestedProduction: mongoose.Schema.Types.ObjectId[],
    recievedProduction: mongoose.Schema.Types.ObjectId[],
    subscribed: Subscription
}

const userSchema = new Schema<UserInterface>({
    retailerName: {
        type:String,
        required: true,
        // unique: true
    },
    email: {
        type: String,
        required : true,
        // unique: true
    },
    password:{
        type:String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        default: 'retailer'
    },
    otpCode:{
        type: Number,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    description:{
        type:String
    },
    connectedProduction:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionAdmin' 
    }],
    requestedProduction:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionAdmin' 
    }],
    recievedProduction:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'ProductionAdmin'
    }],
    subscribed:{
        endDate:{
            type:Date,
        },
        active:{
            type:Boolean,
        },
        duration:{
            type:String,
        }
    }

})

export const retailerAdmin = model<UserInterface>('RetailerAdmin', userSchema);

// export default retailerAdmin; 