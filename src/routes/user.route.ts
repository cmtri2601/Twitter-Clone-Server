import { Router } from 'express';
import { AuthorizationType } from '~/constants/AuthorizationType';
import userController from '~/controllers/user.controller';
import { LoginRequest } from '~/dto/users/Login.dto';
import { RegisterRequest } from '~/dto/users/Register.dto';
import validateAuthorization from '~/middlewares/validateAuthorization';
import validateRequest from '~/middlewares/validateRequest';
import asyncErrorHandler from '~/middlewares/asyncErrorHandler';
import { ForgotPasswordRequest } from '~/dto/users/ForgotPassword';
import { ChangePasswordRequest } from '~/dto/users/ChangePassword';
import { ResetPasswordRequest } from '~/dto/users/ResetPassword';
import { UpdateMeRequest } from '~/dto/users/UpdateMe.dto';

const route = Router();

/**
 * Description: Retrieve all users.
 * Path: users/
 * Method: GET
 */
route.get('/', asyncErrorHandler(userController.findAll));

/**
 * Description: Register a new user.
 * Path: users/register
 * Method: POST
 */
route.post(
  '/register',
  validateRequest(RegisterRequest),
  asyncErrorHandler(userController.register)
);

/**
 * Description: Log in a user.
 * Path: users/login
 * Method: POST
 */
route.post(
  '/login',
  validateRequest(LoginRequest),
  asyncErrorHandler(userController.login)
);

/**
 * Description: Refresh a user's token.
 * Path: users/refresh-token
 * Method: POST
 */
route.post(
  '/refresh-token',
  validateAuthorization(AuthorizationType.REFRESH_TOKEN),
  asyncErrorHandler(userController.refreshToken)
);

/**
 * Description: Log out a user.
 * Path: users/logout
 * Method: POST
 */
route.post(
  '/logout',
  validateAuthorization(AuthorizationType.ACCESS_TOKEN_AND_REFRESH_TOKEN),
  asyncErrorHandler(userController.logout)
);

/**
 * Description: Verify a user.
 * Path: users/verify-email
 * Method: POST
 */
route.post(
  '/verify-email',
  validateAuthorization(AuthorizationType.VERIFY_EMAIL_TOKEN),
  asyncErrorHandler(userController.verifyEmail)
);

/**
 * Description: Resend email to verify user.
 * Path: users/resend-verify-email
 * Method: POST
 */
route.post(
  '/resend-verify-email',
  validateAuthorization(AuthorizationType.ACCESS_TOKEN),
  asyncErrorHandler(userController.resendVerifyEmail)
);

/**
 * Description: Forgot password.
 * Path: users/forgot-password
 * Method: POST
 */
route.post(
  '/forgot-password',
  validateRequest(ForgotPasswordRequest),
  asyncErrorHandler(userController.forgotPassword)
);

/**
 * Description: Reset password.
 * Path: users/reset-password
 * Method: POST
 */
route.post(
  '/reset-password',
  validateAuthorization(AuthorizationType.FORGOT_PASSWORD_TOKEN),
  validateRequest(ResetPasswordRequest),
  asyncErrorHandler(userController.resetPassword)
);

/**
 * Description: Reset password.
 * Path: users/reset-password
 * Method: POST
 */
route.post(
  '/change-password',
  validateAuthorization(),
  validateRequest(ChangePasswordRequest),
  asyncErrorHandler(userController.changePassword)
);

/**
 * Description: Get account's information.
 * Path: users/me
 * Method: GET
 */
route.get(
  '/me',
  validateAuthorization(),
  asyncErrorHandler(userController.getMe)
);

/**
 * Description: Get user's information.
 * Path: users/:userId
 * Method: GET
 */
route.get('/:userId', asyncErrorHandler(userController.getProfile));

/**
 * Description: Change account's information.
 * Path: users/me
 * Method: PATCH
 */
route.patch(
  '/me',
  validateAuthorization(),
  validateRequest(UpdateMeRequest),
  asyncErrorHandler(userController.updateMe)
);

/**
 * Description: Follow user.
 * Path: users/:userId/follow
 * Method: POST
 */
route.post(
  '/:userId/follow',
  validateAuthorization(),
  asyncErrorHandler(userController.follow)
);

/**
 * Description: Unfollow user.
 * Path: users/:userId/unfollow
 * Method: DELETE
 */
route.delete(
  '/:userId/unfollow',
  validateAuthorization(),
  asyncErrorHandler(userController.unfollow)
);

export default route;
