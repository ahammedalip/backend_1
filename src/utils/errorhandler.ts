
interface CustomError {
    StatusCode: number;
    message: string
}


export const errorhandler = (statusCode: number, message: string): CustomError => {
    console.log('coming here to error handler at utils', message);
    return { StatusCode: statusCode, message: message }
}


// export const errorhandler = (StatusCode, message)=>{
//     const error = new Error();
//     error.StatusCode = StatusCode;
//     error.message = message;
//     return error;
// };
