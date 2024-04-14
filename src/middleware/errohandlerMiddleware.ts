import { ErrorRequestHandler } from 'express';

interface CustomError {
  StatusCode?: number;
  message?: string;
}

const errorHandlerMiddleware: ErrorRequestHandler = (err: CustomError, req, res, next) => {
  const statusCode = err.StatusCode || 500;
  const message = err.message || 'Internal server error111';

  console.log('erroro form middleware at error handlemiddleware');

  return res.status(statusCode).json({
    success: false,
    message,
    StatusCode: statusCode,
  });
};

export default errorHandlerMiddleware;
