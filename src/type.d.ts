import { Request } from 'express';
declare module 'express' {
  interface Request {
    authorization?: Authorization;
  }
}
