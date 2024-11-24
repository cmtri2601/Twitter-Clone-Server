import { Request, Response, NextFunction } from 'express';
import userService from '~/services/user.service';

class UserController {
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.findAll();
    console.log(result);
    res.json(result);
  };

  public register = async (req: Request, res: Response, next: NextFunction) => {
    const user = {
      username: 'username',
      password: 'password',
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      verifyToken: 'verifyToken',
      resetPasswordToken: 'resetPasswordToken',
      createAt: new Date(),
      updateAt: new Date()
    };
    const result = await userService.register(user);
    res.json(result);
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    throw new Error('login failed');
    res.send('login successfully');
  };

  public logout = (req: Request, res: Response, next: NextFunction) => {
    res.send('logout successfully');
  };
}

const userController = new UserController();
export default userController;
