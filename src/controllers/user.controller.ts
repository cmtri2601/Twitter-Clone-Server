import { Request, Response } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import { ApplicationResponse } from '~/models/utils/Response';
import userService from '~/services/user.service';

class UserController {
  /**
   * Retrieve all users.
   * @returns A promise that resolves to the list of users.
   */
  public findAll = async (req: Request, res: Response) => {
    const result = await userService.findAll();
    res.json(result);
  };

  /**
   * Register new user.
   * @returns A promise that resolves to the registered user.
   */
  public register = async (req: Request, res: Response) => {
    const data = await userService.register(req.body);
    const response = new ApplicationResponse({
      message: CommonMessage.CREATED,
      detail: UserMessage.REGISTER_SUCCESS,
      data
    });
    res.status(HttpStatus.CREATED).json(response);
  };

  /**
   * Login  user.
   * @returns A promise that resolves to the logged in user
   */
  public login = async (req: Request, res: Response) => {
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
   * Refreshes user's token.
   * @returns A promise that resolves to the refreshed token.
   */
  public refreshToken = async (req: Request, res: Response) => {
    const data = await userService.refreshToken(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.REFRESH_TOKEN_SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Logs out.
   * @returns A promise that resolves to a message indicating that the user has been logged out.
   */
  public logout = async (req: Request, res: Response) => {
    await userService.logout(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.LOGOUT_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Verify email.
   * @returns A promise that resolves to a message indicating that user has been verify.
   */
  public verifyEmail = async (req: Request, res: Response) => {
    const detail = await userService.verifyEmail(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Refreshes a user's token.
   * @returns A promise that resolves to a message indicating that the email has been resent.
   */
  public resendVerifyEmail = async (req: Request, res: Response) => {
    const detail = await userService.resendVerifyEmail(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Forgot password.
   * @returns A promise that resolves to a message that forgot password token has been sent.
   */
  public forgotPassword = async (req: Request, res: Response) => {
    await userService.forgotPassword(req.body);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.SEND_FORGOT_PASSWORD_TOKEN_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Reset password.
   * @returns A promise that resolves to a message that password has been update.
   */
  public resetPassword = async (req: Request, res: Response) => {
    await userService.resetPassword(req.body, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.RESET_PASSWORD_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Change password.
   * @returns A promise that resolves to a message that password has been update.
   */
  public changePassword = async (req: Request, res: Response) => {
    await userService.changePassword(req.body, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.CHANGE_PASSWORD_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Get account's information.
   * @returns A promise that resolves to data of account.
   */
  public getMe = async (req: Request, res: Response) => {
    const data = await userService.getMe(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Get user's information.
   * @returns A promise that resolves to data of user.
   */
  public getProfile = async (req: Request, res: Response) => {
    const data = await userService.getProfile(req.params.userId);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Change account's information.
   * @returns A promise that resolves to data of account.
   */
  public updateMe = async (req: Request, res: Response) => {
    const data = await userService.updateMe(req.body, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Follow user.
   * @returns A promise that resolves to message indicating follow success.
   */
  public follow = async (req: Request, res: Response) => {
    await userService.follow(req.params.userId, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.FOLLOW_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };

  /**
   * Follow user.
   * @returns A promise that resolves to message indicating follow success.
   */
  public unfollow = async (req: Request, res: Response) => {
    await userService.unfollow(req.params.userId, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.UNFOLLOW_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  };
}

const userController = new UserController();
export default userController;
