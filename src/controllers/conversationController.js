"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversation = exports.conversation = void 0;
// import { Messages } from '../models/Messages';
const Conversations_1 = require("../models/Conversations");
const conversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingConversation = yield Conversations_1.Conversation.find({
            members: { $all: [req.body.senderId, req.body.recipientId] }
        });
        if (existingConversation.length > 0) {
            return res.status(200).json({ success: true, existing: 'true' });
        }
        const newConversation = new Conversations_1.Conversation({
            members: [req.body.senderId, req.body.recipientId]
        });
        const savedConversation = yield newConversation.save();
        res.status(200).json({ success: true, savedConversation });
    }
    catch (error) {
        console.log('error at creating conversation', error);
        res.status(500).json({ success: false, message: 'Error while creating conversation' });
    }
});
exports.conversation = conversation;
const getConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield Conversations_1.Conversation.find({
            members: { $in: [req.params.userId] }
        });
        // console.log(conversation);
        res.status(200).json({ success: true, conversation });
    }
    catch (error) {
        console.log('error at getting conversation', error);
        res.status(500).json({ success: false, message: 'error at getting conversation' });
    }
});
exports.getConversation = getConversation;
