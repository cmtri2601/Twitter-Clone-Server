import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrap async function (from controller) to catch error
 * @param fn
 * @returns
 */
const asyncErrorHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncErrorHandler;
