import userDao from '~/database/user.dao';
import { UserEntity, User } from '~/models/schemas/user.schema';
import hash from '~/utils/crypto';
import { sign, verify } from './../utils/jwt';
import { UserStatus } from '~/constants/UserStatus';
import { TokenType } from '~/constants/TokenType';

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

    // create jwt

    // create token
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      user,
      UserStatus.UNVERIFIED
    );

    // TODO:
    console.log('access token: \n', accessToken);
    console.log('refresh token: \n', refreshToken);

    // save user
    const entity = new UserEntity(user);
    return userDao.insertUser(entity);
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
}

const userService = new UserService();
export default userService;
