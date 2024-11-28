import userDao from '~/database/User.dao';
import { UserEntity, User } from '~/models/schemas/User.schema';
import hash from '~/utils/crypto';
import { sign, verify } from './../utils/jwt';
import { UserStatus } from '~/constants/UserStatus';
import { TokenType } from '~/constants/TokenType';
import { omit } from 'lodash';
import refreshTokenDao from '~/database/RefreshToken.dao';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';

class UserService {
  /**
   * Register user service
   * @param user
   * @returns
   */
  public register = async (user: User) => {
    // hash password
    const hashPassword = hash(user.password);
    user.password = hashPassword;
    // TODO: delete
    console.log(user);

    // save user
    const userEntity = new UserEntity(user);
    const { insertedId: userId } = await userDao.insertUser(userEntity);
    // TODO: delete
    console.log(userEntity);

    // create jwt
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      omit(user, ['confirmPassword']) as User,
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

  public findAll = () => {
    return userDao.findAll();
  };

  /**
   * Create access token from payload
   * @param user
   * @param status
   * @returns Promise<string> token
   */
  private signAccessToken = (user: User, status: UserStatus) => {
    return sign(
      { user, type: TokenType.AccessToken, status },
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
  private signRefreshToken = (user: User, status: UserStatus) => {
    return sign(
      { user, type: TokenType.RefreshToken, status },
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
  private signAccessAndRefreshToken = (user: User, status: UserStatus) => {
    return Promise.all([
      this.signAccessToken(user, status),
      this.signRefreshToken(user, status)
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
