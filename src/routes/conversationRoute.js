"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const conversationController_1 = require("../controllers/conversationController");
const router = express_1.default.Router();
router.post('/', conversationController_1.conversation);
router.get('/:userId', conversationController_1.getConversation);
// router.post('/pro',verifySender, sendMessageProduction)
// router.post('/sal', verifySender, sendMessageSales)
// router.post('/get-prod',verifySender, getMessageProd)
// router.post( '/get-sale', verifySender,getMessageSales)
exports.default = router;
