import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import userService from '~/services/user.service';

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  async validate(email: any, args: ValidationArguments) {
    const [expect] = args.constraints;
    const isEmailAlreadyExist = await userService.isEmailAlreadyExist(email);
    return expect ? isEmailAlreadyExist : !isEmailAlreadyExist;
  }

  defaultMessage(args: ValidationArguments) {
    const [expect] = args.constraints;
    return expect
      ? `${args.property} is not exist`
      : `${args.property} is already exist`;
  }
}

export function IsEmailAlreadyExist(
  expect: boolean = false, // default is false, true is want to exist, false is want to not exist
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [expect],
      validator: IsEmailAlreadyExistConstraint
    });
  };
}
