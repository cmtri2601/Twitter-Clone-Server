import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';

export class ApplicationResponse {
  message: CommonMessage;
  details?: any;
  data?: any;

  constructor(message: CommonMessage, details?: any, data?: any) {
    this.message = message;
    this.details = details;
    this.data = data;
  }
}
