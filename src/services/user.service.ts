import { isUndefined, omitBy } from 'lodash';
import { ClientSession, ObjectId } from 'mongodb';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import { TokenType } from '~/constants/TokenType';
import { UserStatus } from '~/constants/UserStatus';
import followerDao from '~/database/Follower.dao';
import refreshTokenDao from '~/database/RefreshToken.dao';
import userDao from '~/database/User.dao';
import Transactional from '~/decorators/Transactional';
import { ChangePasswordRequest } from '~/dto/users/ChangePassword';
import { ForgotPasswordRequest } from '~/dto/users/ForgotPassword';
import { ResetPasswordRequest } from '~/dto/users/ResetPassword';
import { UpdateMeRequest } from '~/dto/users/UpdateMe.dto';
import { FollowerEntity } from '~/models/schemas/Followers.schema';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import { User, UserEntity } from '~/models/schemas/User.schema';
import Authorization from '~/models/utils/Authorization';
import { ApplicationError } from '~/models/utils/Error';
import hash from '~/utils/crypto';
import { sign, verify } from './../utils/jwt';
import axios from 'axios';
import { Media } from '~/models/utils/Media';

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
   * @param user User
   * @returns access token && refreshToken
   */
  @Transactional
  public async register(user: User, session?: ClientSession) {
    // create id
    const _id = new ObjectId();

    // create current ISO date
    const currentISODate = new Date().toISOString();

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
      status: UserStatus.UNVERIFIED,
      verifyEmailToken,
      createAt: currentISODate,
      updateAt: currentISODate
    });
    await userDao.insertUser(userEntity, session);

    // create access and refresh token
    const tokens = await this.signAccessAndRefreshToken(
      _id,
      UserStatus.UNVERIFIED,
      session
    );

    // TODO: send verify email - FAKE (replace with real send email later)
    console.log('Verify email token:', verifyEmailToken);

    // return
    return { ...tokens, user: new User(userEntity) };
  }

  /**
   * Login user
   * @param user User
   * @returns access token && refreshToken
   */
  public async login(user: User): Promise<{
    errors?: UserMessage;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  }> {
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
    return { ...tokens, user: new User(userEntity) };
  }

  /**
   * Login user with google oath
   * @param user User
   * @returns access token && refreshToken
   */
  public async loginGoogle(query: { code: string }): Promise<{
    errors?: UserMessage;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
  }> {
    const token = await this.getGoogleToken(query.code);
    console.log('tokenData', token);

    const user = await this.getGoogleUser(token);
    console.log('userData', user);

    // // hash password
    // const hashPassword = hash(user.password as string);
    // user.password = hashPassword;

    // find user
    const userEntity = await userDao.findByEmail(user.email as string);

    // check user - if not exist register one and return
    if (!userEntity) {
      const newUser: User = {
        email: user.email,
        username: user.sub,
        firstName: user.given_name,
        lastName: user.family_name,
        password: '123456@pQ', // default password
        avatar: new Media(user.picture)
      };
      return await this.register(newUser);
    }

    // create jwt
    const tokens = await this.signAccessAndRefreshToken(
      userEntity._id,
      userEntity.status as UserStatus
    );

    // return
    return { ...tokens, user: new User(userEntity) };
  }

  /**
   * Refresh token
   * @param authorization Authorization
   * @returns access token && refreshToken
   */
  @Transactional
  public async refreshToken(
    authorization: Authorization,
    session?: ClientSession
  ) {
    // delete old refresh token
    await refreshTokenDao.deleteToken(
      authorization.refreshToken as string,
      session
    );

    // create jwt
    const tokens = await this.signAccessAndRefreshToken(
      authorization.userId as ObjectId,
      authorization.status as UserStatus,
      session,
      authorization.exp as number
    );

    // return
    return tokens;
  }

  /**
   * Logout user
   * @param authorization Authorization
   */
  public async logout(authorization: Authorization) {
    // delete old refresh token
    return await refreshTokenDao.deleteToken(
      authorization.refreshToken as string
    );
  }

  /**
   * Verify email token
   * @param authorization Authorization
   * @returns message
   */
  public async verifyEmail(authorization: Authorization) {
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
  }

  /**
   * Resend verify email
   * @param authorization Authorization
   * @returns message
   */
  public async resendVerifyEmail(authorization: Authorization) {
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
  }

  /**
   * Forgot password
   * @param body ForgotPasswordRequest
   */
  public async forgotPassword(body: ForgotPasswordRequest) {
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
      `Please click to this link to reset password: http://localhost:3000/reset-password?token=${forgotPasswordToken}`
    );
  }

  /**
   * Reset password
   * @param body ResetPasswordRequest
   * @param authorization Authorization
   */
  public async resetPassword(
    body: ResetPasswordRequest,
    authorization: Authorization
  ) {
    // hash password
    const hashPassword = hash(body.password as string);

    // save token and password to database
    await userDao.resetPassword(authorization.userId as ObjectId, hashPassword);
  }

  /**
   * Change password
   * @param body ChangePasswordRequest
   * @param authorization Authorization
   */
  public async changePassword(
    body: ChangePasswordRequest,
    authorization: Authorization
  ) {
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
  }

  /**
   * Get account's information
   * @param authorization Authorization
   * @returns user information
   */
  public async getMe(authorization: Authorization) {
    const entity = await userDao.findById(authorization.userId as ObjectId);
    return new User(entity as UserEntity);
  }

  /**
   * Get account's information
   * @param userId string (authorization)
   * @param username string (param)
   * @returns user information
   */
  public async getProfile(username: string, authorization: Authorization) {
    // check user is existed
    const entity = await this.checkUserExistedByUsername(username);

    // if don't have access token, or same user => these variable = undefined
    let isFollow, isFollowed;

    const _id = authorization.userId as ObjectId;
    if (!entity._id.equals(_id)) {
      // check already followed
      isFollow = Boolean(await followerDao.findFollower(_id, entity._id));

      // check already be followed
      isFollowed = Boolean(await followerDao.findFollower(entity._id, _id));
    }

    return { ...new User(entity as UserEntity), isFollow, isFollowed };
  }

  /**
   * Get account's information
   * @param body UpdateMeRequest
   * @param authorization Authorization
   * @returns user after update
   */
  public async updateMe(body: UpdateMeRequest, authorization: Authorization) {
    const userId = authorization.userId as ObjectId;
    // transform body to entity and remove undefined properties
    const updateEntity = omitBy(new UserEntity(body), isUndefined);

    // update user
    const entity = await userDao.update(userId, updateEntity);

    // return
    return new User(entity as UserEntity);
  }

  /**
   * Follow user
   * @param followedUserId string
   * @param authorization Authorization
   * @returns
   */
  public async follow(followedUserId: string, authorization: Authorization) {
    const userId = authorization.userId as ObjectId;

    // check followed user is existed
    const followedUserEntity = await this.checkUserExistedById(followedUserId);

    // check followed user is not current user
    if (followedUserEntity._id.equals(userId)) {
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        CommonMessage.BAD_REQUEST,
        UserMessage.CANNOT_FOLLOW_YOURSELF
      );
    }

    // check user is already followed
    const follower = await followerDao.findFollower(
      userId,
      followedUserEntity._id
    );

    if (follower) {
      // if follower existed, do not insert db
      return;
    }

    // save to database
    await followerDao.insert(
      new FollowerEntity({
        userId: userId,
        followerId: followedUserEntity._id
      })
    );
  }

  /**
   * Unfollow user
   * @param followedUserId string
   * @param authorization Authorization
   * @returns
   */
  public async unfollow(followedUserId: string, authorization: Authorization) {
    const userId = authorization.userId as ObjectId;

    // check followed user is existed
    const followedUserEntity = await this.checkUserExistedById(followedUserId);

    // save to database
    await followerDao.delete(userId, followedUserEntity._id);
  }

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
   * Find user by username and check already exist
   * @returns list users
   */
  public isUsernameAlreadyExist = async (username: string) => {
    return userDao.findByUsername(username).then((user) => {
      return !!user;
    });
  };

  /**
   * Find user by username and check already exist
   * @returns list users
   */
  public isUserIdAlreadyExist = async (userId: string) => {
    return userDao.findById(new ObjectId(userId)).then((user) => {
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
  }; /**
   * Check whether user is verified or not
   * @returns list users
   */
  public isUserVerified = async (userId: ObjectId) => {
    return userDao.findById(userId).then((user) => {
      return !user?.verify_email_token;
    });
  };

  /**
   * Check whether user is existed or not by id
   * @returns if don't exist, throw error
   */
  public checkUserExistedById = async (userId: string) => {
    const entity = await userDao.findById(new ObjectId(userId));

    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    return entity;
  };

  /**
   * Check whether user is existed or not by username
   * @returns if don't exist, throw error
   */
  public checkUserExistedByUsername = async (username: string) => {
    const entity = await userDao.findByUsername(username);

    if (!entity) {
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        CommonMessage.NOT_FOUND,
        UserMessage.USER_NOT_EXISTED
      );
    }

    return entity;
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
          process.env.JWT_REFRESH_TOKEN_KEY as string
          // { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string }
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
    session?: ClientSession,
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
      userId,
      token: refreshToken,
      iat: decoded.iat as number,
      exp: decoded.exp as number
    });
    await refreshTokenDao.insertRefreshToken(refreshTokenEntity, session);

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
   * Get google token
   * @param code
   * @returns Promise<data> contains token
   */
  private getGoogleToken = async (code: string) => {
    const body = {
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URIS,
      grant_type: 'authorization_code'
    };

    const { data } = await axios.post(process.env.TOKEN_URI as string, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return data;
  };

  /**
   * User google token to get google user
   * @param code
   * @returns Promise<data> contains token
   */
  private getGoogleUser = async (token: {
    access_token: string;
    id_token: string;
  }) => {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        params: {
          access_token: token.access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${token.id_token}`
        }
      }
    );

    return data;
  };
}

const userService = new UserService();
export default userService;
