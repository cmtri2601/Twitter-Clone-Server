import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';
import { CommonError } from '~/models/utils/Error';
import filterValidationError from '~/utils/validationErrorFilter';

/**
 * Validate request body with DTO class
 * @param dtoClass
 * @returns
 */
const validateRequest =
  (dtoClass: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body, {
      excludeExtraneousValues: true
    });
    try {
      const errors = await validate(dto);
      if (errors.length > 0) {
        // create error detail
        const details = filterValidationError(errors);

        // create error
        const error = new CommonError(
          HttpStatus.UNPROCESSABLE_ENTITY,
          CommonMessage.UNPROCESSABLE_ENTITY,
          details
        );

        // push error to error handler
        next(error);
      }
    } catch (err) {
      next(err);
    }
    req.body = dto;
    next();
  };

export default validateRequest;
