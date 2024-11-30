import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import database from '.';

class RefreshTokenDao {
  public async insertRefreshToken(entity: RefreshTokenEntity) {
    return await database.refreshTokens.insertOne(entity);
  }

  public async findToken(token: string) {
    return await database.refreshTokens.findOne({ token });
  }

  public async deleteToken(token: string) {
    return await database.refreshTokens.deleteOne({ token });
  }
}

const refreshTokenDao = new RefreshTokenDao();
export default refreshTokenDao;
