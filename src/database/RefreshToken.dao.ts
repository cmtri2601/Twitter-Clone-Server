import { ClientSession } from 'mongodb';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import database from '.';

class RefreshTokenDao {
  public async insertRefreshToken(
    entity: RefreshTokenEntity,
    session?: ClientSession
  ) {
    return await database.refreshTokens.insertOne(entity, { session });
  }

  public async findToken(token: string) {
    return await database.refreshTokens.findOne({ token });
  }

  public async deleteToken(token: string, session?: ClientSession) {
    return await database.refreshTokens.deleteOne({ token }, { session });
  }
}

const refreshTokenDao = new RefreshTokenDao();
export default refreshTokenDao;
