import { Expose } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsStrongPassword,
  MaxLength,
  ValidateIf
} from 'class-validator';
import { IsEmailAlreadyExist } from '~/decorators/IsEmailAlreadyExist';
import { IsMatch } from '~/decorators/IsMatch';

export class RegisterRequest {
  @Expose()
  @IsEmail()
  @IsEmailAlreadyExist()
  email?: string;

  @Expose()
  @MaxLength(30)
  firstName?: string;

  @Expose()
  @MaxLength(30)
  lastName?: string;

  @Expose()
  @MaxLength(50)
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password?: string;

  @Expose()
  @IsMatch('password')
  confirmPassword?: string;

  @Expose()
  @ValidateIf((object, value) => value)
  @IsDateString()
  dateOfBirth?: string;
}
