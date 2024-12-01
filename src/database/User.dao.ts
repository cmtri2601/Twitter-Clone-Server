import { ObjectId } from 'mongodb';
import database from '.';
import { UserEntity } from '~/models/schemas/User.schema';
import { UserStatus } from '~/constants/UserStatus';

class UserDao {
  public async findAll() {
    return await database.users.find().toArray();
  }

  public async findById(_id: ObjectId) {
    return await database.users.findOne({ _id });
  }

  public async findByEmail(email: string) {
    return await database.users.findOne({ email });
  }

  public async findByEmailAndPassword(email: string, password: string) {
    return await database.users.findOne({ email, password });
  }

  public async insertUser(entity: UserEntity) {
    return await database.users.insertOne(entity);
  }

  public async updateUserStatus(_id: ObjectId, status: UserStatus) {
    return await database.users.updateOne(
      { _id },
      {
        $set: { status: status, verify_email_token: '' },
        $currentDate: { update_at: true }
      }
    );
  }
}

const userDao = new UserDao();
export default userDao;
