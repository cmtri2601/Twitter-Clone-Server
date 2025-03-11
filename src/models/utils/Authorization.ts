import { ObjectId } from 'mongodb';
import { UserStatus } from '~/constants/UserStatus';

class Authorization {
  refreshToken?: string;
  userId?: ObjectId;
  exp?: number;

  constructor({
    refreshToken,
    userId,
    exp
  }: {
    refreshToken?: string;
    userId?: ObjectId;
    exp?: number;
  }) {
    this.refreshToken = refreshToken;
    this.userId = userId;
    this.exp = exp;
  }
}

export default Authorization;
