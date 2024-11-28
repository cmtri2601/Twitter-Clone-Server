import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { UserMessage, CommonMessage } from '~/constants/Message';
import { ApplicationResponse } from '~/models/utils/Response';
import userService from '~/services/user.service';

class UserController {
  /**
   * Retrieves all users.
   * @returns A promise that resolves to the list of users.
   */
  public findAll = async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.findAll();
    console.log(result);
    res.json(result);
  };

  /**
   * Registers a new user.
   * @returns A promise that resolves to the registered user.
   */
  public register = async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.register(req.body);
    res
      .status(HttpStatus.CREATED)
      .send(
        new ApplicationResponse(
          CommonMessage.CREATED,
          UserMessage.CREATED,
          data
        )
      );
  };

  /**
   * Logs in a user.
   * @returns A promise that resolves to the logged in user
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    throw new Error('login failed');
    res.send('login successfully');
  };

  /**
   * Logs out a user.
   * @returns A promise that resolves to a message indicating that the user has been logged out.
   */
  public logout = (req: Request, res: Response, next: NextFunction) => {
    res.send('logout successfully');
  };
}

const userController = new UserController();
export default userController;
