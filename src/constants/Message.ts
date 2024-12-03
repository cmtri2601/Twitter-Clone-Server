export enum CommonMessage {
  SUCCESS = 'Success',
  CREATED = 'Created',
  NO_CONTENT = 'No Content',
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  UNPROCESSABLE_ENTITY = 'Unprocessable Entity',
  INTERNAL_SERVER_ERROR = 'Internal Server Error'
}

export enum UserMessage {
  CREATED = 'User created successfully',
  LOGIN_SUCCESS = 'Login successfully',
  LOGIN_FAIL = 'Email or password is incorrect',
  LOGOUT_SUCCESS = 'Logout successfully',
  ACCESS_TOKEN_REQUIRED = 'Access token is required',
  REFRESH_TOKEN_REQUIRED = 'Refresh token is required',
  REFRESH_TOKEN_NOT_EXISTED = 'Refresh token is not existed',
  REFRESH_TOKEN_SUCCESS = 'Refresh token successfully',
  VERIFY_EMAIL_TOKEN_REQUIRED = 'Verify email token is required',
  VERIFY_EMAIL_TOKEN_NOT_EXISTED = 'Verify email token is not existed',
  VERIFY_EMAIL_TOKEN_SUCCESS = 'Verify email token successfully',
  ALREADY_VERIFY_EMAIL_TOKEN = 'Verify email token was already verified',
  RESEND_VERIFY_EMAIL_TOKEN_SUCCESS = 'Resend verify email token successfully'
}
