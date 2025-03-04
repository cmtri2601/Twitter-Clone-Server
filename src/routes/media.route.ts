import { Router } from 'express';
import mediaController from '~/controllers/media.controller';
import userController from '~/controllers/user.controller';
import validateAuthorization from '~/middlewares/validateAuthorization';

const route = Router();

/**
 * Description: Register a new user.
 * Path: users/register
 * Method: POST
 */
route.post(
  '/upload-image',
  validateAuthorization(),
  mediaController.uploadImage
);

/**
 * Description: Get user's information.
 * Path: users/:userId
 * Method: GET
 */
route.get('/image/:name', validateAuthorization(), mediaController.getImage);

export default route;
