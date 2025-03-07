import { Expose } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { MediaType } from '~/constants/MediaType';

export class Media {
  @Expose()
  @MaxLength(200)
  url?: string;

  @Expose()
  @IsNotEmpty()
  type?: MediaType;
}
