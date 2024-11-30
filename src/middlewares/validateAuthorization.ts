import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthorizationType } from '~/constants/AuthorizationType';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import Authorization from '~/models/utils/Authorization';
import { ApplicationError } from '~/models/utils/Error';
import refreshTokenService from '~/services/refreshToken.service';
import { verify } from '~/utils/jwt';

/**
 * Validate access token | refresh token
 * @param type AuthorizationType - default is ACCESS_TOKEN
 * @returns errors | authorization object
 */
const validateAuthorization =
  (type: AuthorizationType = AuthorizationType.ACCESS_TOKEN) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;
    const refreshToken = req.body.refreshToken;
    const authorization: Authorization = {};

    // validate access token
    if (
      type === AuthorizationType.ACCESS_TOKEN ||
      type === AuthorizationType.ACCESS_TOKEN_AND_REFRESH_TOKEN
    ) {
      console.log('Access token ', accessToken);
      if (!accessToken) {
        console.log('Access token is required');
      }

      // const decoded = await verify(
      //   accessToken as string,
      //   process.env.JWT_ACCESS_TOKEN_KEY as string
      // );

      // if (!decoded) {
      //   console.log('Access token is invalid');
      //   console.log('Access token is expire');
      // }
    }

    // validate refresh token
    if (
      type === AuthorizationType.REFRESH_TOKEN ||
      type === AuthorizationType.ACCESS_TOKEN_AND_REFRESH_TOKEN
    ) {
      // case: req body doesn't have refresh token
      if (!refreshToken) {
        return next(
          new ApplicationError(
            HttpStatus.UNAUTHORIZED,
            CommonMessage.UNAUTHORIZED,
            UserMessage.REFRESH_TOKEN_REQUIRED
          )
        );
      }

      try {
        const [isRefreshTokenExist, decoded] = await Promise.all([
          refreshTokenService.isRefreshTokenExist(refreshToken),
          verify(
            refreshToken as string,
            process.env.JWT_REFRESH_TOKEN_KEY as string
          )
        ]);

        // case: refresh token is not exist in db
        if (!isRefreshTokenExist) {
          return next(
            new ApplicationError(
              HttpStatus.UNAUTHORIZED,
              CommonMessage.UNAUTHORIZED,
              UserMessage.REFRESH_TOKEN_NOT_EXISTED
            )
          );
        }

        // case: refresh token is valid -> set value to authorization object
        authorization.refreshToken = refreshToken;
        authorization.userId = decoded.userId;
        authorization.status = decoded.status;
        authorization.exp = decoded.exp;
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          // case: refresh token is invalid
          return next(
            new ApplicationError(
              HttpStatus.UNAUTHORIZED,
              CommonMessage.UNAUTHORIZED,
              error.message
            )
          );
        }
        // case: unknown error
        return next(
          new ApplicationError(
            HttpStatus.UNAUTHORIZED,
            CommonMessage.UNAUTHORIZED,
            (error as any).message
          )
        );
      }
    }

    // return dto if errors aren't existed
    req.authorization = authorization;
    next();
  };
export default validateAuthorization;
