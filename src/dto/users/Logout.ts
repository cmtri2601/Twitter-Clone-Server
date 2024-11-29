import { Expose } from 'class-transformer';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class RegisterRequest {
  @Expose()
  @IsEmail()
  email?: string;

  @Expose()
  @MinLength(6)
  @MaxLength(50)
  password?: string;
}
