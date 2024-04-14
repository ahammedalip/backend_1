"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversationId: {
        type: String
    },
    sender: {
        type: String
    },
    text: {
        type: String
    },
    imageUrl: {
        type: String
    },
    videoUrl: {
        type: String
    }
}, { timestamps: true });
exports.Messages = (0, mongoose_1.model)('Message', messageSchema);
