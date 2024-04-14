"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandlerMiddleware = (err, req, res, next) => {
    const statusCode = err.StatusCode || 500;
    const message = err.message || 'Internal server error111';
    console.log('erroro form middleware at error handlemiddleware');
    return res.status(statusCode).json({
        success: false,
        message,
        StatusCode: statusCode,
    });
};
exports.default = errorHandlerMiddleware;
