import { Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { IsEmailAlreadyExist } from '~/decorators/IsEmailAlreadyExist';

export class ForgotPasswordRequest {
  @Expose()
  @IsEmail()
  @IsEmailAlreadyExist(true)
  email?: string;
}
