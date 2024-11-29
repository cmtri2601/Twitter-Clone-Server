import { CommonMessage } from '~/constants/Message';

export class ApplicationResponse {
  message: CommonMessage;
  detail?: any;
  errors?: any;
  data?: any;

  constructor({
    message,
    detail,
    errors,
    data
  }: {
    message: CommonMessage;
    detail?: any;
    errors?: any;
    data?: any;
  }) {
    this.message = message;
    this.detail = detail;
    this.errors = errors;
    this.data = data;
  }
}
