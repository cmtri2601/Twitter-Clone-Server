import { ObjectId } from 'mongodb';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import { TokenType } from '~/constants/TokenType';
import { UserStatus } from '~/constants/UserStatus';
import refreshTokenDao from '~/database/RefreshToken.dao';
import userDao from '~/database/User.dao';
import { ChangePasswordRequest } from '~/dto/users/ChangePassword';
import { ForgotPasswordRequest } from '~/dto/users/ForgotPassword';
import { ResetPasswordRequest } from '~/dto/users/ResetPassword';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import { User, UserEntity } from '~/models/schemas/User.schema';
import Authorization from '~/models/utils/Authorization';
import { ApplicationError } from '~/models/utils/Error';
import hash from '~/utils/crypto';
import { sign, verify } from './../utils/jwt';
import { UpdateMeRequest } from '~/dto/users/UpdateMe.dto';
import { isUndefined, omitBy } from 'lodash';

class UserService {
  /**
   * Find all user in database
   * @returns list users
   */
  public findAll = () => {
    return userDao.findAll();
  };

  /**
   * Register new user
   * @param user
   * @returns access token && refreshToken
   */
  public register = async (user: User) => {
    // create id
    const _id = new ObjectId();

    // create verify email token
    const verifyEmailToken = await this.signVerifyEmailToken(
      _id,
      UserStatus.UNVERIFIED
    );

    // hash password
    const hashPassword = hash(user.password as string);

    // save user
    const userEntity = new UserEntity({
      ...user,
      _id,
      password: hashPassword,
      verifyEmailToken
    });
    await userDao.insertUser(userEntity);

    // create access and refresh token
    const tokens = await this.signAccessAndRefreshToken(
      _id,
      UserStatus.UNVERIFIED
    );

    // TODO: send verify email - FAKE (replace with real send email later)
    console.log('Verify email token:', verifyEmailToken);

    // return
    return tokens;
  };

  /**
   * Login user
   * @param user
   * @returns access token && refreshToken
   */
  public login = async (
    user: User
  ): Promise<{
    errors?: UserMessage;
    accessToken?: string;
    refreshToken?: string;
  }> => {
    // hash password
    const hashPassword = hash(user.password as string);
    user.password = hashPassword;

    // find user
    const userEntity = await userDao.findByEmailAndPassword(
      user.email as string,
      hashPassword
    );

    // check user
    if (!userEntity) {
      return {
        errors: UserMessage.LOGIN_FAIL
      };
    }

    // create jwt
    const tokens = await this.signAccessAndRefreshToken(
      userEntity._id,
      userEntity.status as UserStatus
    );

    // return
    return tokens;
  };

  /**
   * Refresh token
   * @param authorization
   * @returns access token && refreshToken
   */
  public refreshToken = async (authorization: Authorization) => {
    // delete old refresh token
    await refreshTokenDao.deleteToken(authorization.refreshToken as string);

    // create jwt
    const tokens = await this.signAccessAndRefreshToken(
      authorization.userId as ObjectId,
      authorization.status as UserStatus
    );

    // return
    return tokens;
  };

  /**
   * Logout user
   * @param authorization
   * @returns access token && refreshToken
   */
  public logout = async (authorization: Authorization) => {
    // delete old refresh token
    return await refreshTokenDao.deleteToken(
      authorization.refreshToken as string
    );
  };

  /**
   * Verify email token
   * @param authorization
   * @returns
   */
  public verifyEmail = async (authorization: Authorization) => {
    // check user is verified
    const isVerified = await this.isUserVerified(
      authorization.userId as ObjectId
    );

    if (isVerified) {
      return UserMessage.ALREADY_VERIFY_EMAIL_TOKEN;
    }

    // update user status
    const result = await userDao.updateVerifyEmailToken(
      authorization.userId as ObjectId,
      '', // remove verify email token
      UserStatus.VERIFIED
    );

    // return
    return UserMessage.VERIFY_EMAIL_TOKEN_SUCCESS;
  };

  /**
   * Resend verify email
   * @param authorization
   * @returns
   */
  public resendVerifyEmail = async (authorization: Authorization) => {
    // check user is verified
    const isVerified = await this.isUserVerified(
      authorization.userId as ObjectId
    );

    if (isVerified) {
      return UserMessage.ALREADY_VERIFY_EMAIL_TOKEN;
    }

    // create verify email token
    const verifyEmailToken = await this.signVerifyEmailToken(
      authorization.userId as ObjectId,
      UserStatus.UNVERIFIED
    );

    // update user status
    await userDao.updateVerifyEmailToken(
      authorization.userId as ObjectId,
      verifyEmailToken,
      UserStatus.UNVERIFIED
    );

    // TODO: send verify email - FAKE (replace with real send email later)
    console.log('Verify email token:', verifyEmailToken);

    return UserMessage.RESEND_VERIFY_EMAIL_TOKEN_SUCCESS;
  };

  /**
   * Forgot password
   * @param authorization
   * @returns
   */
  public forgotPassword = async (body: ForgotPasswordRequest) => {
    // create forgot password token
    const forgotPasswordToken = await this.signForgotPasswordToken(
      body.email as string
    );

    // save token to database
    await userDao.updateForgotPasswordToken(
      body.email as string,
      forgotPasswordToken
    );

    // TODO: send verify email - FAKE (replace with real send email later)
    console.log(
      `Please click to this link to reset password: http://localhost:3000/users/reset-password?token=${forgotPasswordToken}`
    );
  };

  /**
   * Reset password
   * @param authorization
   * @returns
   */
  public resetPassword = async (
    body: ResetPasswordRequest,
    authorization: Authorization
  ) => {
    // hash password
    const hashPassword = hash(body.password as string);

    // save token and password to database
    await userDao.resetPassword(authorization.userId as ObjectId, hashPassword);
  };

  /**
   * Change password
   * @param authorization
   * @returns
   */
  public changePassword = async (
    body: ChangePasswordRequest,
    authorization: Authorization
  ) => {
    // hash old password
    const hashOldPassword = hash(body.oldPassword as string);

    // check old password
    const entity = await userDao.findById(authorization.userId as ObjectId);
    if (!entity || entity.password !== hashOldPassword) {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        CommonMessage.UNAUTHORIZED,
        UserMessage.PASSWORD_NOT_MATCH
      );
    }

    // hash password
    const hashPassword = hash(body.newPassword as string);

    // save token and password to database
    await userDao.changePassword(
      authorization.userId as ObjectId,
      hashPassword
    );
  };

  /**
   * Get account's information
   * @param authorization
   * @returns
   */
  public getMe = async (authorization: Authorization) => {
    const entity = await userDao.findById(authorization.userId as ObjectId);

    // check user is existed
    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    return new User(entity);
  };

  /**
   * Get account's information
   * @param authorization
   * @returns
   */
  public getProfile = async (userId: string) => {
    const entity = await userDao.findById(new ObjectId(userId));

    // check user is existed
    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    return new User(entity);
  };

  /**
   * Get account's information
   * @param authorization
   * @returns
   */
  public updateMe = async (
    body: UpdateMeRequest,
    authorization: Authorization
  ) => {
    const userId = authorization.userId as ObjectId;
    // transform body to entity and remove undefined properties
    const updateEntity = omitBy(new UserEntity(body), isUndefined);

    // update user
    const entity = await userDao.update(userId, updateEntity);

    // check user is existed
    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    // return
    return new User(entity);
  };

  /**
   * Find user by email and check email already exist
   * @returns list users
   */
  public isEmailAlreadyExist = async (email: string) => {
    return userDao.findByEmail(email).then((user) => {
      return !!user;
    });
  };

  /**
   * Find user by userId
   * @returns list users
   */
  public findUserById = async (_id: ObjectId) => {
    return userDao.findById(_id);
  };

  /**
   * Find user by email
   * @returns list users
   */
  public findUserByEmail = async (email: string) => {
    return userDao.findByEmail(email);
  };

  /**
   * Create access token from payload
   * @param user
   * @param status
   * @returns Promise<string> token
   */
  private signAccessToken = (userId: ObjectId, status: UserStatus) => {
    return sign(
      { userId, type: TokenType.AccessToken, status },
      process.env.JWT_ACCESS_TOKEN_KEY as string,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string }
      // { expiresIn: '5s' } // TODO: for testing
    );
  };

  /**
   * Create refresh token from payload
   * @param user
   * @param status
   * @returns Promise<string> token
   */
  private signRefreshToken = (
    userId: ObjectId,
    status: UserStatus,
    exp?: number
  ) => {
    return exp
      ? sign(
          { userId, type: TokenType.RefreshToken, status, exp },
          process.env.JWT_REFRESH_TOKEN_KEY as string,
          { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string }
          // { expiresIn: '5s' } // TODO: for testing
        )
      : sign(
          { userId, type: TokenType.RefreshToken, status },
          process.env.JWT_REFRESH_TOKEN_KEY as string,
          { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string }
          // { expiresIn: '5s' } // TODO: for testing
        );
  };

  /**
   * Create access and refresh token from payload
   * @param user
   * @param status
   * @returns [Promise<string>] tokens
   */
  private signAccessAndRefreshToken = async (
    userId: ObjectId,
    status: UserStatus,
    exp?: number
  ) => {
    // sign jwt
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(userId, status),
      this.signRefreshToken(userId, status, exp)
    ]);

    // decode to get iat and exp
    const decoded = await verify(
      refreshToken as string,
      process.env.JWT_REFRESH_TOKEN_KEY as string
    );

    // save refresh token
    const refreshTokenEntity = new RefreshTokenEntity({
      user_id: userId,
      token: refreshToken,
      iat: decoded.iat as number,
      exp: decoded.exp as number
    });
    refreshTokenDao.insertRefreshToken(refreshTokenEntity);

    // return
    return { accessToken, refreshToken };
  };

  /**
   * Create verify token token from payload
   * @param user
   * @param status
   * @returns Promise<string> token
   */
  private signVerifyEmailToken = (userId: ObjectId, status: UserStatus) => {
    return sign(
      { userId, type: TokenType.EmailVerifyToken, status },
      process.env.JWT_VERIFY_EMAIL_TOKEN_KEY as string,
      { expiresIn: process.env.JWT_VERIFY_EMAIL_TOKEN_EXPIRES_IN as string }
      // { expiresIn: '5s' } // TODO: for testing
    );
  };

  /**
   * Create verify token token from payload
   * @param user
   * @param status
   * @returns Promise<string> token
   */
  private signForgotPasswordToken = (email: string) => {
    return sign(
      { email, type: TokenType.ForgotPasswordToken },
      process.env.JWT_FORGOT_PASSWORD_TOKEN_KEY as string,
      { expiresIn: process.env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string }
      // { expiresIn: '5s' } // TODO: for testing
    );
  };

  /**
   * Check whether user is verified or not
   * @returns list users
   */
  public isUserVerified = async (userId: ObjectId) => {
    return userDao.findById(userId).then((user) => {
      return !user?.verify_email_token;
    });
  };
}

const userService = new UserService();
export default userService;
