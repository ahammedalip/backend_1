import mongoose,{Document,Schema, model} from "mongoose"

interface Conversation extends Document{
    members: string[]
}

const conversationSchema = new Schema<Conversation>({
    members:{
        type: [String],
    }
},{
    timestamps: true
})


export const Conversation = model<Conversation>('Conversation', conversationSchema)