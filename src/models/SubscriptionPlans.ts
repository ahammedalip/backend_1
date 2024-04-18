import { Document, Schema, model } from 'mongoose';


interface UserInterface extends Document {
    name: string,
    amount: string,
    features: string,
    duration: string,
    role: string,
    active:boolean,
}

const subscriptionSchema = new Schema<UserInterface>({
    name: {
        type: String,
    },
    amount: {
        type: String
    },
    features: {
        type: String,
    },
    duration: {
        type: String,
    },
    role: {
        type: String
    },
    active:{
        type:Boolean,
        default:true,
    },
});

export const subscriptionPlans = model<UserInterface>('subPlans', subscriptionSchema);
