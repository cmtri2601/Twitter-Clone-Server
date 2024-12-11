import { Request, Response, NextFunction } from 'express';

/**
 * Decorator that wrap async function (from controller) to catch error
 * Similar to ~/middlewares/asyncErrorHandler
 * @param target class
 * @param propertyKey name of method
 * @param descriptor descriptor of method
 */
export default function AsyncErrorWrapper(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const fn = descriptor.value;
  const wrapFn = function (req: Request, res: Response, next?: NextFunction) {
    const result = Promise.resolve(fn(req, res, next)).catch(next);
    return result;
  };
  descriptor.value = wrapFn;
}
