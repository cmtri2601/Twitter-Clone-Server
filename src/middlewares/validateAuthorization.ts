import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthorizationType } from '~/constants/AuthorizationType';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import asyncErrorHandler from '~/middlewares/asyncErrorHandler';
import Authorization from '~/models/utils/Authorization';
import { ApplicationError } from '~/models/utils/Error';
import refreshTokenService from '~/services/refreshToken.service';
import { verify } from '~/utils/jwt';

/**
 * Validate access token | refresh token
 * @param type AuthorizationType - default is ACCESS_TOKEN
 * @returns errors | authorization object
 */
const validateAuthorization = (
  type: AuthorizationType = AuthorizationType.ACCESS_TOKEN
) =>
  asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    let authorization: Authorization | undefined;

    switch (type) {
      case AuthorizationType.ACCESS_TOKEN: {
        authorization = await validateAccessToken(req);
        break;
      }
      case AuthorizationType.REFRESH_TOKEN: {
        authorization = await validateRefreshToken(req);
        break;
      }
      case AuthorizationType.ACCESS_TOKEN_AND_REFRESH_TOKEN: {
        const [access, refresh] = await Promise.all([
          validateAccessToken(req),
          validateRefreshToken(req)
        ]);
        authorization = { ...access, ...refresh };
        break;
      }
      case AuthorizationType.VERIFY_EMAIL_TOKEN: {
        break;
      }
      case AuthorizationType.FORGOT_PASSWORD_TOKEN: {
        break;
      }
      default:
        break;
    }

    // return dto if errors aren't existed
    req.authorization = authorization;
    next();
  });

/**
 * Validate access token
 * @param req contains access token
 * @returns authorization object
 */
const validateAccessToken = async (
  req: Request
): Promise<Authorization | undefined> => {
  // get access token from req header authorization
  const accessToken = req.headers.authorization?.split(' ')[1];

  try {
    // case: req body doesn't have refresh token
    if (!accessToken) {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        CommonMessage.UNAUTHORIZED,
        UserMessage.ACCESS_TOKEN_REQUIRED
      );
    }

    const { userId, status } = await verify(
      accessToken as string,
      process.env.JWT_ACCESS_TOKEN_KEY as string
    );

    // case: access token is valid -> set value to authorization object
    return new Authorization({ userId, status });
  } catch (error) {
    catchError(error);
  }
};

/**
 * Validate refresh token
 * @param req contains refresh token
 * @returns authorization object
 */
const validateRefreshToken = async (
  req: Request
): Promise<Authorization | undefined> => {
  // get refresh token from req body
  const refreshToken = req.body.refreshToken;

  try {
    // case: req body doesn't have refresh token
    if (!refreshToken) {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        CommonMessage.UNAUTHORIZED,
        UserMessage.REFRESH_TOKEN_REQUIRED
      );
    }
    const [isRefreshTokenExist, decoded] = await Promise.all([
      refreshTokenService.isRefreshTokenExist(refreshToken),
      verify(
        refreshToken as string,
        process.env.JWT_REFRESH_TOKEN_KEY as string
      )
    ]);

    // case: refresh token is not exist in db
    if (!isRefreshTokenExist) {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        CommonMessage.UNAUTHORIZED,
        UserMessage.REFRESH_TOKEN_NOT_EXISTED
      );
    }

    // case: refresh token is valid -> set value to authorization object
    return new Authorization({
      refreshToken,
      userId: decoded.userId,
      status: decoded.status,
      exp: decoded.exp
    });
  } catch (error) {
    catchError(error);
  }
};

/**
 * Catch and transform each type of error
 * @param error
 * @returns
 */
const catchError = (error: any) => {
  if (error instanceof JsonWebTokenError) {
    // case: access token is invalid
    throw new ApplicationError(
      HttpStatus.UNAUTHORIZED,
      CommonMessage.UNAUTHORIZED,
      error.message
    );
  }

  // case: unknown error || ApplicationError
  throw error;
};

export default validateAuthorization;
