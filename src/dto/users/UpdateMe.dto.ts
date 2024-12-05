import { Expose } from 'class-transformer';
import { IsDateString, IsOptional, MaxLength } from 'class-validator';

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
  @MaxLength(200)
  avatar?: string;

  @Expose()
  @IsOptional()
  @MaxLength(200)
  coverPhoto?: string;
}
