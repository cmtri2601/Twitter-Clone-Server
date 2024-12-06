import { ObjectId } from 'mongodb';

export interface RefreshToken {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  createAt?: Date;
  iat: number;
  exp: number;
}

export class RefreshTokenEntity {
  _id?: ObjectId;
  user_id: ObjectId;
  token: string;
  create_at: Date;
  iat: Date;
  exp: Date;

  constructor(refreshToken: RefreshToken) {
    this._id = refreshToken._id;
    this.user_id = refreshToken.userId;
    this.token = refreshToken.token;
    this.create_at = refreshToken.createAt ?? new Date();
    this.iat = new Date(refreshToken.iat * 1000);
    this.exp = new Date(refreshToken.exp * 1000);
  }
}
