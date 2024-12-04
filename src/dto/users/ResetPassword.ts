import { Expose } from 'class-transformer';
import { IsStrongPassword, MaxLength } from 'class-validator';
import { IsMatch } from '~/decorators/IsMatch';

export class ResetPasswordRequest {
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
}
