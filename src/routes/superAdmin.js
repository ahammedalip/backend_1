"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const superAdmin_1 = require("../controllers/SuperAdmin/superAdmin");
const verifyUser_1 = require("../utils/verifyUser");
const router = express_1.default.Router();
router.post('/Admin-auth', superAdmin_1.login);
router.get('/retailer_list', verifyUser_1.verifyAdmin, superAdmin_1.getRetailerList);
router.get('/production_list', verifyUser_1.verifyAdmin, superAdmin_1.getProductionList);
router.put('/toggle_block_update', verifyUser_1.verifyAdmin, superAdmin_1.blockUser);
router.get('/mini-report', verifyUser_1.verifyAdmin, superAdmin_1.miniReport);
router.get('/revenue', verifyUser_1.verifyAdmin, superAdmin_1.getRevenue);
router.get('/report', verifyUser_1.verifyAdmin, superAdmin_1.getReport);
exports.default = router;
