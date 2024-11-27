import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage } from '~/constants/Message';

export class CommonError {
  status: HttpStatus;
  message: CommonMessage;
  details?: any;

  constructor(status: HttpStatus, message: CommonMessage, detail?: any) {
    this.status = status;
    this.message = message;
    this.details = detail;
  }
}
