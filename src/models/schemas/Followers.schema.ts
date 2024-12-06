import { ObjectId } from 'mongodb';

export interface Follower {
  _id?: ObjectId;
  userId: ObjectId;
  followerId: ObjectId;
  create_at?: Date;
}

export class FollowerEntity {
  _id?: ObjectId;
  user_id: ObjectId;
  follower_id: ObjectId;
  create_at: Date;

  constructor(follower: Follower) {
    this._id = follower._id;
    this.user_id = follower.userId;
    this.follower_id = follower.followerId;
    this.create_at = follower.create_at ?? new Date();
  }
}
