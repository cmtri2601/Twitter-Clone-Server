import database from '.';
import { UserEntity } from '~/models/schemas/user.schema';

class UserDao {
  public async findAll() {
    return await database.users.find().toArray();
  }

  public async insertUser(user: UserEntity) {
    return await database.users.insertOne(user);
  }
}

const userDao = new UserDao();
export default userDao;
