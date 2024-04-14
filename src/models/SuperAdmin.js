"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdmin = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});
exports.superAdmin = (0, mongoose_1.model)('superAdmin', userSchema);
