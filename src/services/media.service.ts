import fs from 'fs/promises';
import { Request } from 'express';
import { File } from 'formidable';
import { getNameWithoutExtension, handleUploadImage } from '~/utils/file';
import sharp from 'sharp';
import path from 'path';
import { UPLOAD_IMAGES_DIR } from '~/constants/Dir';
import { Media } from '~/models/utils/Media';
import { MediaType } from '~/constants/MediaType';

class MediaService {
  /**
   * Upload image
   * @param req Request
   * @returns Media[]
   */
  public async uploadImage(req: Request): Promise<Media[]> {
    // handle file by formidable
    const data = await handleUploadImage(req);

    // handle file by sharp
    const result = await Promise.all(
      (data.files.image as File[]).map(async (file) => {
        // create file jpeg to save
        const newName = getNameWithoutExtension(file.newFilename);
        const newFullName = newName + '.jpg';
        const curPath = file.filepath;
        const newPath = path.join(UPLOAD_IMAGES_DIR, newFullName);
        await sharp(curPath).jpeg().toFile(newPath);

        // delete temp file
        await fs.unlink(curPath);

        // return media obj
        return new Media(
          `http://localhost:${process.env.PORT}/api/media/image/${newName}`,
          MediaType.IMAGE
        );
      })
    );

    // return
    return result;
  }
}

const mediaService = new MediaService();
export default mediaService;
