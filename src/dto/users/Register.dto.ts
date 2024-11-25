import { Type } from 'class-transformer';
import { IsNotEmpty, Length, MaxLength, ValidateNested } from 'class-validator';

export class RegisterRequest {
  @Length(10, 20)
  username?: string;

  @MaxLength(30)
  firstName?: string;

  @MaxLength(30)
  lastName?: string;

  @IsNotEmpty()
  password?: string;

  confirmPassword?: string;

  @ValidateNested()
  @Type(() => SomeThing)
  something?: SomeThing;
}

class SomeThing {
  @IsNotEmpty()
  name?: string;
}
