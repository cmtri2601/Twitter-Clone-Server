import { Expose, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsNotEmpty,
  Length,
  MaxLength,
  ValidateNested
} from 'class-validator';

export class ExampleRequest {
  @Expose()
  @Length(10, 20)
  username?: string;

  @Expose()
  @MaxLength(30)
  firstName?: string;

  @Expose()
  @MaxLength(30)
  lastName?: string;

  @Expose()
  @IsNotEmpty()
  password?: string;

  @Expose()
  confirmPassword?: string;

  @Expose()
  @ValidateNested()
  @Type(() => SomeThing)
  something?: SomeThing;

  @Expose()
  @ValidateNested()
  @ArrayMaxSize(2)
  @Type(() => SomeThingDiff)
  somethingArray?: SomeThingDiff[];
}

class SomeThing {
  @Expose()
  @IsNotEmpty()
  name?: string;

  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SubName)
  subName?: SubName;
}

class SomeThingDiff {
  @Expose()
  @IsNotEmpty()
  name?: string;
}

class SubName {
  @Expose()
  @IsNotEmpty()
  name?: string;
}
