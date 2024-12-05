import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AuthorizationType } from '~/constants/AuthorizationType';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import { UserStatus } from '~/constants/UserStatus';
import asyncErrorHandler from '~/middlewares/asyncErrorHandler';
import Authorization from '~/models/utils/Authorization';
import { ApplicationError } from '~/models/utils/Error';
import refreshTokenService from '~/services/refreshToken.service';
import userService from '~/services/user.service';
import { verify } from '~/utils/jwt';

/**
 * Validate access token | refresh token | verify email token | forgot password token
 * @param type AuthorizationType - default is ACCESS_TOKEN
 * @returns authorization object | throw error
 */
const validateAuthorization = (
  type: AuthorizationType = AuthorizationType.VERIFIED_USER
) =>
  asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    let authorization: Authorization | undefined;

    switch (type) {
      case AuthorizationType.VERIFIED_USER: {
        authorization = await validateAccessToken(req);
        validateVerifiedUser(authorization);
        break;
      }
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
        authorization = await validateVerifyEmailToken(req);
        break;
      }
      case AuthorizationType.FORGOT_PASSWORD_TOKEN: {
        authorization = await validateForgotPasswordToken(req);
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
 * Validate is user verified
 * @param authorization contain user status
 * @returns authorization object
 */
const validateVerifiedUser = (authorization?: Authorization) => {
  if (!authorization || authorization.status !== UserStatus.VERIFIED) {
    throw new ApplicationError(
      HttpStatus.FORBIDDEN,
      CommonMessage.FORBIDDEN,
      UserMessage.USER_IS_NOT_VERIFIED
    );
  }
};

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
    return new Authorization({
      userId: new ObjectId(userId as string),
      status
    });
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
        HttpStatus.BAD_REQUEST,
        CommonMessage.BAD_REQUEST,
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
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.REFRESH_TOKEN_NOT_EXISTED
      );
    }

    // case: refresh token is valid -> set value to authorization object
    return new Authorization({
      refreshToken,
      userId: new ObjectId(decoded.userId as string),
      status: decoded.status,
      exp: decoded.exp
    });
  } catch (error) {
    catchError(error);
  }
};

/**
 * Validate refresh token
 * @param req contains refresh token
 * @returns authorization object
 */
const validateVerifyEmailToken = async (
  req: Request
): Promise<Authorization | undefined> => {
  // get verify email token from req body
  const verifyEmailToken = req.body.verifyEmailToken;

  try {
    // case: req body doesn't have verify token
    if (!verifyEmailToken) {
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        CommonMessage.BAD_REQUEST,
        UserMessage.VERIFY_EMAIL_TOKEN_REQUIRED
      );
    }

    // decode verify email token
    const { userId, status } = await verify(
      verifyEmailToken as string,
      process.env.JWT_VERIFY_EMAIL_TOKEN_KEY as string
    );

    // check token is existed in db
    const entity = await userService.findUserById(
      new ObjectId(userId as string)
    );

    // case: user not existed
    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    // case: verify email token is not exist in db
    if (
      entity.verify_email_token && // if false => already verified
      entity.verify_email_token !== verifyEmailToken // wrong token
    ) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.VERIFY_EMAIL_TOKEN_NOT_EXISTED
      );
    }

    // case: verify email token is valid -> set value to authorization object
    return new Authorization({
      userId: new ObjectId(userId as string),
      status
    });
  } catch (error) {
    catchError(error);
  }
};

/**
 * Validate refresh token
 * @param req contains refresh token
 * @returns authorization object
 */
const validateForgotPasswordToken = async (
  req: Request
): Promise<Authorization | undefined> => {
  // get forgot password token from req body
  const forgotPasswordToken = req.body.forgotPasswordToken;

  try {
    // case: req body doesn't have verify token
    if (!forgotPasswordToken) {
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        CommonMessage.BAD_REQUEST,
        UserMessage.FORGOT_PASSWORD_TOKEN_REQUIRED
      );
    }

    // decode verify email token
    const { email } = await verify(
      forgotPasswordToken as string,
      process.env.JWT_FORGOT_PASSWORD_TOKEN_KEY as string
    );

    // check token is existed in db
    const entity = await userService.findUserByEmail(email);

    // case: user not existed
    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    // case: forgot password token is not exist in db
    if (
      entity.forgot_password_token !== forgotPasswordToken // wrong token
    ) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.FORGOT_PASSWORD_TOKEN_NOT_EXISTED
      );
    }

    // case: verify email token is valid -> set value to authorization object
    return new Authorization({ userId: entity._id });
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
