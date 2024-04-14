
import mongoose, { Document, Schema, model } from "mongoose";

interface Order extends Document {
    productionId:mongoose.Schema.Types.ObjectId;
    salesExecId: mongoose.Schema.Types.ObjectId;
    retailerId:mongoose.Schema.Types.ObjectId;
    scheduledDate: Date;
    imageURL:string[];
    quantity:number;
    status: string;
    blocked:boolean;
    accepted:string;
    description: string;
    item:string;
    updateRequest:string;

}

const OrderSchema = new Schema<Order>({
    productionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionAdmin'
    },
    salesExecId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RetailerSales'
    },
    retailerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RetailerAdmin'
    },
    scheduledDate:{
        type:Date
    },
    imageURL:[{
        type:String,

    }],
    quantity:{
        type:Number
    },
    status:{
        type:String
    },
    blocked:{
        type:Boolean,
        default: false
    },
    accepted:{
        type:String,
        default: 'No'
    },
    description:{
        type:String,
    },
    item:{
        type:String,
    },
    updateRequest:{
        type:String,

    }


},{timestamps:true})

const order = model<Order>('Order',OrderSchema)

export default order;

