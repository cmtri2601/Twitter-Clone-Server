import { ObjectId } from 'mongodb';
import { UserStatus } from '~/constants/UserStatus';

export class User {
  _id?: ObjectId;
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  status?: UserStatus;

  verifyEmailToken?: string;
  forgotPasswordToken?: string;

  createAt?: string;
  updateAt?: string;

  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string;
  avatar?: string;
  coverPhoto?: string;

  // don't expose sensitive information to the client
  constructor(user: UserEntity) {
    this._id = user._id;
    this.email = user.email;
    // this.password = user.password;
    this.username = user.username;
    this.firstName = user.first_name;
    this.lastName = user.last_name;
    this.status = user.status;
    // this.verifyEmailToken = user.verify_email_token;
    // this.forgotPasswordToken = user.forgot_password_token;
    // this.createAt = user.create_at.toISOString();
    // this.updateAt = user.update_at.toISOString();
    this.bio = user.bio;
    this.location = user.location;
    this.website = user.website;
    this.dateOfBirth = user.day_of_birth?.toISOString();
    this.avatar = user.avatar;
    this.coverPhoto = user.cover_photo;
  }
}

export class UserEntity {
  _id?: ObjectId;
  email?: string;
  password?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  status?: UserStatus;

  verify_email_token?: string;
  forgot_password_token?: string;

  create_at?: Date;
  update_at?: Date;

  bio?: string;
  location?: string;
  website?: string;
  day_of_birth?: Date;
  avatar?: string;
  cover_photo?: string;

  constructor(user: User) {
    this._id = user._id;
    this.email = user.email;
    this.password = user.password;
    this.username = user.username;
    this.first_name = user.firstName;
    this.last_name = user.lastName;
    this.status = user.status;
    this.verify_email_token = user.verifyEmailToken;
    this.forgot_password_token = user.forgotPasswordToken;
    this.create_at = user.createAt ? new Date(user.createAt) : undefined;
    this.update_at = user.updateAt ? new Date(user.updateAt) : undefined;
    this.bio = user.bio;
    this.location = user.location;
    this.website = user.website;
    this.day_of_birth = user.dateOfBirth
      ? new Date(user.dateOfBirth)
      : undefined;
    this.avatar = user.avatar;
    this.cover_photo = user.coverPhoto;
  }
}
