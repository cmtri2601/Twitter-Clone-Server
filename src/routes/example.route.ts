import { Router } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { ExampleRequest } from '~/dto/example.dto';
import asyncErrorHandler from '~/middlewares/asyncErrorHandler';
import validateAuthorization from '~/middlewares/validateAuthorization';
import validateRequest from '~/middlewares/validateRequest';
import Logger from '~/utils/logger';

const exampleRoutes = Router();

exampleRoutes.post(
  '/validate',
  validateRequest(ExampleRequest),
  // validateToken(),
  validateAuthorization(),
  async (req, res, next) => {
    // next('catch error'); // no CRASH
    // throw Error("Don't catch =>  error"); // CRASH because throw but NO CATCH in ASYNC function
    next();
  },
  asyncErrorHandler(async (req, res, next) => {
    // throw Error('use asyncErrorHandler to catch => no error'); // no CRASH
    next();
  }),
  (req, res) => {
    res.status(HttpStatus.SUCCESS).json('done example');
  }
);

exampleRoutes.get('/logger', (_, res) => {
  Logger.error('This is an error log');
  Logger.warn('This is a warn log');
  Logger.info('This is a info log');
  Logger.http('This is a http log');
  Logger.debug('This is a debug log');

  res.send('Hello, this is the logger');
});

export default exampleRoutes;
