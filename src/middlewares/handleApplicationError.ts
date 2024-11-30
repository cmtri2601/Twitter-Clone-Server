import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';
import { ApplicationError } from '~/models/utils/Error';
import { ApplicationResponse } from '~/models/utils/Response';

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
    // catch error that is PREDICTABLE
    const response = new ApplicationResponse({
      message: error.message,
      errors: error.errors
    });
    res.status(error.status).json(response);
  } else {
    // catch error that is UNPREDICTABLE

    // TODO: delete
    console.error(error);

    // message and stack default not enumerable, but application just need message to expose
    if (typeof error === 'object') {
      Object.defineProperty(error, 'message', {
        enumerable: true
      });
    }

    const response = new ApplicationResponse({
      message: CommonMessage.INTERNAL_SERVER_ERROR,
      errors: error
    });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
  }
};
