import { Router } from 'express';
import userController from '~/controllers/user.controller';
import asyncErrorHandler from '~/middlewares/wrap';

const route = Router();

route.get('/', asyncErrorHandler(userController.findAll));
route.post('/register', asyncErrorHandler(userController.register));
route.post('/login', asyncErrorHandler(userController.login));
route.post('/logout', asyncErrorHandler(userController.logout));

export default route;
