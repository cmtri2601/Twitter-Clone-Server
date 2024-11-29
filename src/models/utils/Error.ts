import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';

export class ApplicationError {
  status: HttpStatus;
  message: CommonMessage;
  errors?: any;

  constructor(status: HttpStatus, message: CommonMessage, errors?: any) {
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}
