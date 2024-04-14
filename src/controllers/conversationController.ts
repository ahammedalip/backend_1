import  { Request, Response } from 'express'
// import { Messages } from '../models/Messages';
import { Conversation } from '../models/Conversations';



export const conversation = async(req:Request, res:Response) =>{
    try {
        const existingConversation = await Conversation.find({
            members: {$all:[req.body.senderId, req.body.recipientId]}
        })

        if(existingConversation.length>0){
            return res.status(200).json({success: true, existing: 'true' })
        }
        const newConversation = new Conversation ({
            members : [req.body.senderId, req.body.recipientId]
        })

        const savedConversation = await newConversation.save()
        res.status(200).json({success:true, savedConversation})
    } catch (error) {
        console.log('error at creating conversation', error);
        res.status(500).json({success:false, message: 'Error while creating conversation'})
    }
}

export const getConversation = async(req:Request, res:Response) =>{
    try {
        const conversation = await Conversation.find({
            members:{$in: [req.params.userId]}
        })
        // console.log(conversation);
        res.status(200).json({success: true, conversation})
    } catch (error) {
        console.log('error at getting conversation', error);
        res.status(500).json({success:false, message: 'error at getting conversation'})
    }
}

