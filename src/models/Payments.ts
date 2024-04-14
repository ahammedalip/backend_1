import mongoose,{Document,Schema, model} from "mongoose"

interface Payment {
    userId: mongoose.Schema.Types.ObjectId,
    amount: number,
    period: string,
    user: string,
}


const paymentsSchema = new Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role',
    },
    amount:{
        type: Number,
        // required: true,
    },
    role: {
        type: String,
        enum: ['RetailerAdmin', 'ProductionAdmin'],
    },    
    period:{
        type: String,

    }

},{timestamps:true})

const payment = model<Payment>('payments', paymentsSchema)

export default payment;