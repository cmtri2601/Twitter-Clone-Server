import { Request, Response } from 'express';
import path from 'path';
import { UPLOAD_IMAGES_DIR } from '~/constants/Dir';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, MediaMessage } from '~/constants/Message';
import AsyncErrorWrapper from '~/decorators/AsyncErrorWrapper';
import { ApplicationError } from '~/models/utils/Error';
import { ApplicationResponse } from '~/models/utils/Response';
import mediaService from '~/services/media.service';

class MediaController {
  /**
   * Register new user.
   * @returns A promise that resolves to the registered user.
   */
  @AsyncErrorWrapper
  public async uploadImage(req: Request, res: Response) {
    const data = await mediaService.uploadImage(req);
    const response = new ApplicationResponse({
      message: CommonMessage.CREATED,
      detail: MediaMessage.UPLOAD_IMAGES_SUCCESS,
      data
    });
    res.status(HttpStatus.CREATED).json(response);
  }

  /**
   * Get image.
   * @returns File.
   */
  @AsyncErrorWrapper
  public async getImage(req: Request, res: Response) {
    const { name } = req.params;
    const imagePath = path.join(UPLOAD_IMAGES_DIR, name) + '.jpg';
    console.log(imagePath);
    res.sendFile(imagePath, (err) => {
      if (err) {
        res
          .status(HttpStatus.NOT_FOUND)
          .send(
            new ApplicationError(
              HttpStatus.NOT_FOUND,
              CommonMessage.NOT_FOUND,
              'Can not find the file'
            )
          );
      }
    });
  }
}

const mediaController = new MediaController();
export default mediaController;
