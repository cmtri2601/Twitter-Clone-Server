import { Request, Response } from 'express';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, UserMessage } from '~/constants/Message';
import AsyncErrorWrapper from '~/decorators/AsyncErrorWrapper';
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
  @AsyncErrorWrapper
  public async register(req: Request, res: Response) {
    const data = await userService.register(req.body);
    const response = new ApplicationResponse({
      message: CommonMessage.CREATED,
      detail: UserMessage.REGISTER_SUCCESS,
      data
    });
    res.status(HttpStatus.CREATED).json(response);
  }

  /**
   * Login  user.
   * @returns A promise that resolves to the logged in user
   */
  @AsyncErrorWrapper
  public async login(req: Request, res: Response) {
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
  }

  /**
   * Login  user with google oauth.
   * @returns A promise that resolves to the logged in user
   */
  @AsyncErrorWrapper
  public async loginGoogle(req: Request, res: Response) {
    const data = await userService.loginGoogle(req.query as { code: string });

    res.redirect(
      `${process.env.CLIENT_URL}/oauth/google?access_token=${data.accessToken}&refresh_token=${data.refreshToken}&user=${JSON.stringify(data.user)}` as string
    );
  }

  /**
   * Refreshes user's token.
   * @returns A promise that resolves to the refreshed token.
   */
  @AsyncErrorWrapper
  public async refreshToken(req: Request, res: Response) {
    const data = await userService.refreshToken(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.REFRESH_TOKEN_SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Logs out.
   * @returns A promise that resolves to a message indicating that the user has been logged out.
   */
  @AsyncErrorWrapper
  public async logout(req: Request, res: Response) {
    await userService.logout(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.LOGOUT_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Verify email.
   * @returns A promise that resolves to a message indicating that user has been verify.
   */
  @AsyncErrorWrapper
  public async verifyEmail(req: Request, res: Response) {
    const detail = await userService.verifyEmail(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Refreshes a user's token.
   * @returns A promise that resolves to a message indicating that the email has been resent.
   */
  @AsyncErrorWrapper
  public async resendVerifyEmail(req: Request, res: Response) {
    const detail = await userService.resendVerifyEmail(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Forgot password.
   * @returns A promise that resolves to a message that forgot password token has been sent.
   */
  @AsyncErrorWrapper
  public async forgotPassword(req: Request, res: Response) {
    await userService.forgotPassword(req.body);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.SEND_FORGOT_PASSWORD_TOKEN_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Reset password.
   * @returns A promise that resolves to a message that password has been update.
   */
  @AsyncErrorWrapper
  public async resetPassword(req: Request, res: Response) {
    await userService.resetPassword(req.body, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.RESET_PASSWORD_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Change password.
   * @returns A promise that resolves to a message that password has been update.
   */
  @AsyncErrorWrapper
  public async changePassword(req: Request, res: Response) {
    await userService.changePassword(req.body, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.CHANGE_PASSWORD_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Get account's information.
   * @returns A promise that resolves to data of account.
   */
  @AsyncErrorWrapper
  public async getMe(req: Request, res: Response) {
    const data = await userService.getMe(req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Get user's information.
   * @returns A promise that resolves to data of user.
   */
  @AsyncErrorWrapper
  public async getProfile(req: Request, res: Response) {
    const data = await userService.getProfile(
      req.params.username,
      req.authorization
    );
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Change account's information.
   * @returns A promise that resolves to data of account.
   */
  @AsyncErrorWrapper
  public async updateMe(req: Request, res: Response) {
    const data = await userService.updateMe(req.body, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      data
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Follow user.
   * @returns A promise that resolves to message indicating follow success.
   */
  @AsyncErrorWrapper
  public async follow(req: Request, res: Response) {
    await userService.follow(req.params.userId, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.FOLLOW_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }

  /**
   * Follow user.
   * @returns A promise that resolves to message indicating follow success.
   */
  @AsyncErrorWrapper
  public async unfollow(req: Request, res: Response) {
    await userService.unfollow(req.params.userId, req.authorization);
    const response = new ApplicationResponse({
      message: CommonMessage.SUCCESS,
      detail: UserMessage.UNFOLLOW_SUCCESS
    });
    res.status(HttpStatus.SUCCESS).json(response);
  }
}

const userController = new UserController();
export default userController;
