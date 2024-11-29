import database from '.';
import { UserEntity } from '~/models/schemas/User.schema';

class UserDao {
  public async findAll() {
    return await database.users.find().toArray();
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
}

const userDao = new UserDao();
export default userDao;
