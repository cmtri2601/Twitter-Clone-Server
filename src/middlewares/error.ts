import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';
import { ApplicationError } from '~/models/utils/Error';

/**
 * Handle error from the application
 * @param error
 * @param req
 * @param res
 * @param next
 */
export const errorHandler = (
  error: ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApplicationError) {
    res
      .status(error.status)
      .json({ message: error.message, details: error?.details });
  } else {
    // TODO: delete
    console.error(error);

    // message and stack default not enumerable, but application just need message to expose
    Object.defineProperty(error, 'message', {
      enumerable: true
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: CommonMessage.INTERNAL_SERVER_ERROR,
      details: error
    });
  }
};
