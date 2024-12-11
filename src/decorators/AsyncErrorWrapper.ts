import { NextFunction, Request, Response } from 'express';

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
  // get original function
  const fn = descriptor.value;

  // create new function that wrap original function
  const wrapFn = function (req: Request, res: Response, next?: NextFunction) {
    const result = Promise.resolve(fn(req, res, next)).catch(next);
    return result;
  };

  // assign new function to descriptor
  descriptor.value = wrapFn;
}
