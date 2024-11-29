import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';
import { ApplicationError } from '~/models/utils/Error';
import filterValidationError from '~/utils/validationErrorFilter';

/**
 * Validate request body with DTO class
 * @param dtoClass
 * @returns errors || dto
 */
const validateRequest =
  (dtoClass: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // transfer json to class
    const dto = plainToInstance(dtoClass, req.body, {
      excludeExtraneousValues: true
    });

    // validate and return errors if existed
    try {
      const errors = await validate(dto);
      if (errors.length > 0) {
        // create error detail
        const conciseErrors = filterValidationError(errors);

        // create error
        const error = new ApplicationError(
          HttpStatus.UNPROCESSABLE_ENTITY,
          CommonMessage.UNPROCESSABLE_ENTITY,
          conciseErrors
        );

        // push error to error handler
        next(error);
      }
    } catch (err) {
      next(err);
    }

    // return dto if errors aren't existed
    req.body = dto;
    next();
  };

export default validateRequest;
