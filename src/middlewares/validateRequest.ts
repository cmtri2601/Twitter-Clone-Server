import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

const validateRequest =
  (dtoClass: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    try {
      const errors = await validate(dto);
      if (errors.length > 0) {
        res.status(422).send(errors);
      }
    } catch (err) {
      next(err);
    }
    req.body = dto;
    next();
  };

export default validateRequest;
