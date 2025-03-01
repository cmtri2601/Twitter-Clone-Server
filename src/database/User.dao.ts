import { ClientSession, ObjectId } from 'mongodb';
import { UserStatus } from '~/constants/UserStatus';
import { UpdateMeRequest } from '~/dto/users/UpdateMe.dto';
import { UserEntity } from '~/models/schemas/User.schema';
import database from '.';

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

  public async findByUsername(username: string) {
    return await database.users.findOne({ username });
  }

  public async findByEmailAndPassword(email: string, password: string) {
    return await database.users.findOne({ email, password });
  }

  public async insertUser(entity: UserEntity, session?: ClientSession) {
    return await database.users.insertOne(entity, { session });
  }

  public async updateVerifyEmailToken(
    _id: ObjectId,
    token: string,
    status: UserStatus
  ) {
    return await database.users.updateOne(
      { _id },
      {
        $set: { status: status, verify_email_token: token },
        $currentDate: { update_at: true }
      }
    );
  }

  public async updateForgotPasswordToken(email: string, token: string) {
    return await database.users.updateOne(
      { email },
      {
        $set: { forgot_password_token: token },
        $currentDate: { update_at: true }
      }
    );
  }

  public async resetPassword(_id: ObjectId, password: string) {
    return await database.users.updateOne(
      { _id },
      {
        $set: { forgot_password_token: '', password },
        $currentDate: { update_at: true }
      }
    );
  }

  public async changePassword(_id: ObjectId, password: string) {
    return await database.users.updateOne(
      { _id },
      {
        $set: { password },
        $currentDate: { update_at: true }
      }
    );
  }

  public async update(_id: ObjectId, user: UpdateMeRequest) {
    return await database.users.findOneAndUpdate(
      { _id },
      {
        $set: { ...user },
        $currentDate: { update_at: true }
      },
      {
        returnDocument: 'after'
      }
    );
  }
}

const userDao = new UserDao();
export default userDao;
