import { MediaType } from '~/constants/MediaType';

export class Media {
  url?: string;
  type?: MediaType;

  constructor(url?: string, type?: MediaType) {
    this.url = url;
    this.type = type;
  }
}
