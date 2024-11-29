import userDao from '~/database/User.dao';
import { UserEntity, User } from '~/models/schemas/User.schema';
import hash from '~/utils/crypto';
import { sign, verify } from './../utils/jwt';
import { UserStatus } from '~/constants/UserStatus';
import { TokenType } from '~/constants/TokenType';
import { omit } from 'lodash';
import refreshTokenDao from '~/database/RefreshToken.dao';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import { UserMessage } from '~/constants/Message';
import { ObjectId } from 'mongodb';

class UserService {
  /**
   * Register new user
   * @param user
   * @returns access token && refreshToken
   */
  public register = async (user: User) => {
    // hash password
    const hashPassword = hash(user.password);
    user.password = hashPassword;

    // save user
    const userEntity = new UserEntity(user);
    const { insertedId: userId } = await userDao.insertUser(userEntity);

    // create jwt
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      userId,
      UserStatus.UNVERIFIED
    );

    // save refresh token
    const { iat, exp } = await this.decodeRefreshToken(refreshToken as string);
    const refreshTokenEntity = new RefreshTokenEntity({
      user_id: userId,
      token: refreshToken,
      iat: iat as number,
      exp: exp as number
    });
    refreshTokenDao.insertRefreshToken(refreshTokenEntity);

    // send verified email

    // return
    return {
      accessToken,
      refreshToken
    };
  };

  /**
   * Login user
   * @param user
   * @returns access token && refreshToken
   */
  public login = async (user: User) => {
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
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      userEntity._id,
      UserStatus.UNVERIFIED
    );

    // save refresh token
    const { iat, exp } = await this.decodeRefreshToken(refreshToken as string);
    const refreshTokenEntity = new RefreshTokenEntity({
      user_id: userEntity._id,
      token: refreshToken,
      iat: iat as number,
      exp: exp as number
    });
    refreshTokenDao.insertRefreshToken(refreshTokenEntity);

    // return
    return {
      accessToken,
      refreshToken
    };
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
        )
      : sign(
          { userId, type: TokenType.RefreshToken, status },
          process.env.JWT_REFRESH_TOKEN_KEY as string,
          { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string }
        );
  };

  /**
   * Create access and refresh token from payload
   * @param user
   * @param status
   * @returns [Promise<string>] tokens
   */
  private signAccessAndRefreshToken = (
    userId: ObjectId,
    status: UserStatus
  ) => {
    return Promise.all([
      this.signAccessToken(userId, status),
      this.signRefreshToken(userId, status)
    ]);
  };

  /**
   * Decode refresh token from payload
   * @param user
   * @param status
   * @returns Promise<string> token
   */
  private decodeRefreshToken = (token: string) => {
    return verify(token, process.env.JWT_REFRESH_TOKEN_KEY as string);
  };
}

const userService = new UserService();
export default userService;
