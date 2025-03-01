import { Expose } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsStrongPassword,
  MaxLength
} from 'class-validator';
import { IsEmailAlreadyExist } from '~/decorators/IsEmailAlreadyExist';
import { IsMatch } from '~/decorators/IsMatch';
import { IsUsernameAlreadyExist } from '~/decorators/IsUsernameAlreadyExist';

export class RegisterRequest {
  @Expose()
  @IsEmail()
  @IsEmailAlreadyExist()
  email?: string;

  @Expose()
  @MaxLength(40)
  @IsUsernameAlreadyExist()
  username?: string;

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
  @IsOptional()
  @IsDateString({ strict: true, strictSeparator: true })
  dateOfBirth?: string;
}
