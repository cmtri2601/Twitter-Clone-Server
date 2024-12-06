import { ObjectId } from 'mongodb';
import { FollowerEntity } from '~/models/schemas/Followers.schema';
import database from '.';

class FollowerDao {
  public async insert(entity: FollowerEntity) {
    return await database.followers.insertOne(entity);
  }

  public async delete(userId: ObjectId, followerId: ObjectId) {
    return await database.followers.deleteOne({
      user_id: userId,
      follower_id: followerId
    });
  }

  public async findFollower(userId: ObjectId, followerId: ObjectId) {
    return await database.followers.findOne({
      user_id: userId,
      follower_id: followerId
    });
  }
}

const followerDao = new FollowerDao();
export default followerDao;
