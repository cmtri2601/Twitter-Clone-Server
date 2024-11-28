import { Router } from 'express';
import userController from '~/controllers/user.controller';
import { RegisterRequest } from '~/dto/users/Register.dto';
import validateRequest from '~/middlewares/validate';
import asyncErrorHandler from '~/utils/wrap';

const route = Router();

route.get('/', asyncErrorHandler(userController.findAll));
route.post(
  '/register',
  validateRequest(RegisterRequest),
  asyncErrorHandler(userController.register)
);
route.post('/login', asyncErrorHandler(userController.login));
route.post('/logout', asyncErrorHandler(userController.logout));

export default route;
