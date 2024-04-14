"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorhandler = void 0;
const errorhandler = (statusCode, message) => {
    console.log('coming here to error handler at utils', message);
    return { StatusCode: statusCode, message: message };
};
exports.errorhandler = errorhandler;
// export const errorhandler = (StatusCode, message)=>{
//     const error = new Error();
//     error.StatusCode = StatusCode;
//     error.message = message;
//     return error;
// };
