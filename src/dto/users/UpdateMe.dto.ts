import { Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Media } from '../Media';

export class UpdateMeRequest {
  @Expose()
  @IsOptional()
  @MaxLength(30)
  firstName?: string;

  @Expose()
  @IsOptional()
  @MaxLength(30)
  lastName?: string;

  @Expose()
  @IsOptional()
  @IsDateString({ strict: true, strictSeparator: true })
  dateOfBirth?: string;

  @Expose()
  @IsOptional()
  @MaxLength(200)
  bio?: string;

  @Expose()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @Expose()
  @IsOptional()
  @MaxLength(100)
  website?: string;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => Media)
  avatar?: Media;

  @Expose()
  @IsOptional()
  @MaxLength(200)
  coverPhoto?: string;
}
