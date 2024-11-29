import { Router } from 'express';
import userController from '~/controllers/user.controller';
import { LoginRequest } from '~/dto/users/Login.dto';
import { RegisterRequest } from '~/dto/users/Register.dto';
import validateRequest from '~/middlewares/validate';
import asyncErrorHandler from '~/utils/wrap';

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
 * Description: Logs out a user.
 * Path: users/logout
 * Method: POST
 */
route.post('/logout', asyncErrorHandler(userController.logout));

export default route;
