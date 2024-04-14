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
exports.getMessage = exports.addMessage = void 0;
const Messages_1 = require("../models/Messages");
const Conversations_1 = require("../models/Conversations");
const addMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newMessage = new Messages_1.Messages(req.body);
    try {
        const savedMessage = yield newMessage.save();
        res.status(200).json({ success: true, savedMessage });
    }
    catch (error) {
        console.log('error at adding messages', error);
        res.status(500).json({ success: false, message: 'error while adding message' });
    }
});
exports.addMessage = addMessage;
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.query.sender;
        const recipientId = req.query.recipient;
        const conversation = yield Conversations_1.Conversation.findOne({
            members: { $all: [senderId, recipientId] }
        });
        const messages = yield Messages_1.Messages.find({
            conversationId: conversation === null || conversation === void 0 ? void 0 : conversation._id
        });
        res.status(200).json({ success: true, messages, conversationId: conversation === null || conversation === void 0 ? void 0 : conversation._id });
    }
    catch (error) {
        console.log('error at getting messages', error);
        res.status(500).json({ success: false, message: 'error while fetching message' });
    }
});
exports.getMessage = getMessage;
