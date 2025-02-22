import refreshTokenDao from '~/database/RefreshToken.dao';

class RefreshTokenService {
  /**
   * Check refresh token is existed
   * @param token
   * @returns Promise<boolean>
   */
  public isRefreshTokenExist = async (token: string) => {
    const entity = await refreshTokenDao.findToken(token);
    return !!entity;
  };
}

const refreshTokenService = new RefreshTokenService();
export default refreshTokenService;
