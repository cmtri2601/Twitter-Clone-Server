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
  USER_NOT_EXISTED = 'User is not existed',
  USER_IS_NOT_VERIFIED = 'User have not been verified',
  REGISTER_SUCCESS = 'Register user successfully',
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
  RESEND_VERIFY_EMAIL_TOKEN_SUCCESS = 'Verify email was send, please check your email',
  SEND_FORGOT_PASSWORD_TOKEN_SUCCESS = 'Reset password email was send, please check your email',
  FORGOT_PASSWORD_TOKEN_REQUIRED = 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_NOT_EXISTED = 'Forgot password token is not existed',
  RESET_PASSWORD_SUCCESS = 'Reset password successfully',
  PASSWORD_NOT_MATCH = 'Password is not match',
  CHANGE_PASSWORD_SUCCESS = 'Change password successfully'
}
