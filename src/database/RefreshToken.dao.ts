import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import database from '.';

class RefreshTokenDao {
  public async insertRefreshToken(entity: RefreshTokenEntity) {
    return await database.refreshTokens.insertOne(entity);
  }
}

const refreshTokenDao = new RefreshTokenDao();
export default refreshTokenDao;
