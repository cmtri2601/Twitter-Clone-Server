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
import Authorization from '~/models/utils/Authorization';

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
    const tokens = await this.signAccessAndRefreshToken(
      userId,
      UserStatus.UNVERIFIED
    );

    // send verified email

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
   * @param user
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
}

const userService = new UserService();
export default userService;
