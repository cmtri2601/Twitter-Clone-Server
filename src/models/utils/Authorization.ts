import { ObjectId } from 'mongodb';
import { UserStatus } from '~/constants/UserStatus';

class Authorization {
  refreshToken?: string;
  userId?: ObjectId;
  status?: UserStatus;
  exp?: number;

  constructor({
    refreshToken,
    userId,
    status,
    exp
  }: {
    refreshToken?: string;
    userId?: ObjectId;
    status?: UserStatus;
    exp?: number;
  }) {
    this.refreshToken = refreshToken;
    this.userId = userId;
    this.status = status;
    this.exp = exp;
  }
}

export default Authorization;
