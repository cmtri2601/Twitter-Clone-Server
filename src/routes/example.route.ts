import { Router } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { ExampleRequest } from '~/dto/example.dto';
import asyncErrorHandler from '~/middlewares/asyncErrorHandler';
import validateAuthorization from '~/middlewares/validateAuthorization';
import validateRequest from '~/middlewares/validateRequest';

const exampleRoutes = Router();

exampleRoutes.post(
  '/',
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

export default exampleRoutes;
