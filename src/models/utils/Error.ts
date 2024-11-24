import { CommonMessage } from '~/constants/CommonMessage';
import { HttpStatus } from '~/constants/HttpStatus';

export class CommonError {
  status: HttpStatus;
  message: CommonMessage;
  details?: ErrorDetail[];

  constructor(status: HttpStatus, message: CommonMessage) {
    this.status = status;
    this.message = message;
  }
}

export class ErrorDetail {
  field: string;
  message: string;

  constructor(field: string, message: string) {
    this.field = field;
    this.message = message;
  }
}
