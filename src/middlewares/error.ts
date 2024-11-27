import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';
import { CommonError } from '~/models/utils/Error';

/**
 * Handle error from the application
 * @param error
 * @param req
 * @param res
 * @param next
 */
export const errorHandler = (
  error: CommonError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof CommonError) {
    res
      .status(error.status)
      .json({ message: error.message, details: error?.details });
  } else {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: CommonMessage.INTERNAL_SERVER_ERROR,
      details: error
    });
  }
};
