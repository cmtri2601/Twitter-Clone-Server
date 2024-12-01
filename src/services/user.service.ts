import { ObjectId } from 'mongodb';
import { UserMessage } from '~/constants/Message';
import { TokenType } from '~/constants/TokenType';
import { UserStatus } from '~/constants/UserStatus';
import refreshTokenDao from '~/database/RefreshToken.dao';
import userDao from '~/database/User.dao';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import { User, UserEntity } from '~/models/schemas/User.schema';
import Authorization from '~/models/utils/Authorization';
import hash from '~/utils/crypto';
import { sign, verify } from './../utils/jwt';

class UserService {
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
    const hashPassword = hash(user.password);

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
    const hashPassword = hash(user.password);
    user.password = hashPassword;

    // find user
    const userEntity = await userDao.findByEmailAndPassword(
      user.email,
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
      UserStatus.UNVERIFIED
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
    // update user status
    const result = await userDao.updateUserStatus(
      authorization.userId as ObjectId,
      UserStatus.VERIFIED
    );

    // return
    return result;
  };

  /**
   * Find all user in database
   * @returns list users
   */
  public findAll = () => {
    return userDao.findAll();
  };

  /**
   * Find user by email and check email already exist
   * @returns list users
   */
  public isEmailAlreadyExist = async (email: string) => {
    return userDao.findByEmail(email).then((user) => {
      if (user) return false;
      return true;
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
}

const userService = new UserService();
export default userService;
