import { Expose } from 'class-transformer';
import { IsNotEmpty, IsStrongPassword, MaxLength } from 'class-validator';
import { IsMatch } from '~/decorators/IsMatch';

export class ChangePasswordRequest {
  @Expose()
  @IsNotEmpty()
  @MaxLength(50)
  oldPassword?: string;

  @Expose()
  @IsNotEmpty()
  @MaxLength(50)
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  newPassword?: string;

  @Expose()
  @IsNotEmpty()
  @IsMatch('newPassword')
  confirmPassword?: string;
}
