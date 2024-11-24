import { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncErrorHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncErrorHandler;
