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
  REFRESH_TOKEN_REQUIRED = 'Refresh token is required',
  REFRESH_TOKEN_NOT_EXISTED = 'Refresh token is not existed',
  REFRESH_TOKEN_SUCCESS = 'Refresh token successfully'
}
