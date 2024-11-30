import { Router } from 'express';
import { AuthorizationType } from '~/constants/AuthorizationType';
import userController from '~/controllers/user.controller';
import { LoginRequest } from '~/dto/users/Login.dto';
import { RegisterRequest } from '~/dto/users/Register.dto';
import validateAuthorization from '~/middlewares/validateAuthorization';
import validateRequest from '~/middlewares/validateRequest';
import asyncErrorHandler from '~/middlewares/asyncErrorHandler';

const route = Router();

/**
 * Description: Retrieves all users.
 * Path: users/
 * Method: GET
 */
route.get('/', asyncErrorHandler(userController.findAll));

/**
 * Description: Registers a new user.
 * Path: users/register
 * Method: POST
 */
route.post(
  '/register',
  validateRequest(RegisterRequest),
  asyncErrorHandler(userController.register)
);

/**
 * Description: Logs in a user.
 * Path: users/login
 * Method: POST
 */
route.post(
  '/login',
  validateRequest(LoginRequest),
  asyncErrorHandler(userController.login)
);

/**
 * Description: Refreshes a user's token.
 * Path: users/refresh-token
 * Method: POST
 */
route.post(
  '/refresh-token',
  validateAuthorization(AuthorizationType.REFRESH_TOKEN),
  asyncErrorHandler(userController.refreshToken)
);

/**
 * Description: Logs out a user.
 * Path: users/logout
 * Method: POST
 */
route.post(
  '/logout',
  validateAuthorization(AuthorizationType.ACCESS_TOKEN_AND_REFRESH_TOKEN),
  asyncErrorHandler(userController.logout)
);

export default route;
