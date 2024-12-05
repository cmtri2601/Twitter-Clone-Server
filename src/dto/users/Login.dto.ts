import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginRequest {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @Expose()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password?: string;
}
