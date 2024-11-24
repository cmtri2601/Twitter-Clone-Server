import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;

  verifyToken: string;
  resetPasswordToken: string;

  createAt: Date;
  updateAt: Date;

  bio?: string;
  location?: string;
  website?: string;
  dayOfBirth?: Date;
  avatar?: string;
  coverPhoto?: string;
}

export class UserEntity {
  _id?: ObjectId;
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;

  verify_token: string;
  reset_password_token: string;

  create_at: Date;
  update_at: Date;

  bio?: string;
  location?: string;
  website?: string;
  day_of_birth?: Date;
  avatar?: string;
  cover_photo?: string;

  constructor(user: User) {
    this._id = user._id;
    this.email = user.email;
    this.username = user.username;
    this.password = user.password;
    this.first_name = user.firstName;
    this.last_name = user.lastName;
    this.verify_token = user.verifyToken;
    this.reset_password_token = user.resetPasswordToken;
    this.create_at = user.createAt;
    this.update_at = user.updateAt;
    this.bio = user.bio;
    this.location = user.location;
    this.website = user.website;
    this.day_of_birth = user.dayOfBirth;
    this.avatar = user.avatar;
    this.cover_photo = user.coverPhoto;
  }
}
