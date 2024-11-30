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
    const response = new ApplicationResponse({
      message: CommonMessage.CREATED,
      detail: UserMessage.CREATED,
      data
    });
    res.status(HttpStatus.CREATED).json(response);
  };

  /**
   * Logs in a user.
   * @returns A promise that resolves to the logged in user
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    const data = await userService.login(req.body);

    // check result
    if (data?.errors === UserMessage.LOGIN_FAIL) {
      // case login fail
      const response = new ApplicationResponse({
        message: CommonMessage.UNAUTHORIZED,
        errors: data.errors
      });
      res.status(HttpStatus.UNAUTHORIZED).json(response);
    } else {
      // case login success
      const response = new ApplicationResponse({
        message: CommonMessage.SUCCESS,
        detail: UserMessage.LOGIN_SUCCESS,
        data
      });
      res.status(HttpStatus.SUCCESS).json(response);
    }
  };

  /**
   * Refreshes a user's token.
   * @returns A promise that resolves to the refreshed token.
   */
  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data = await userService.refreshToken(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.REFRESH_TOKEN_SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Logs out a user.
   * @returns A promise that resolves to a message indicating that the user has been logged out.
   */
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    await userService.logout(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.LOGOUT_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };
}

const userController = new UserController();
export default userController;
