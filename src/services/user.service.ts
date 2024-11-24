import userDao from '~/database/user.dao';
import { UserEntity, User } from '~/models/schemas/user.schema';

class UserService {
  public register = (user: User) => {
    return userDao.insertUser(new UserEntity(user));
  };

  public findAll = () => {
    return userDao.findAll();
  };
}

const userService = new UserService();
export default userService;
