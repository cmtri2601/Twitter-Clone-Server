import { Request } from 'express';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';
import {
  UPLOAD_IMAGES_TEMP_DIR,
  UPLOAD_VIDEOS_TEMP_DIR
} from '~/constants/Dir';
import { HttpStatus } from '~/constants/HttpStatus';
import { CommonMessage, MediaMessage } from '~/constants/Message';
import { ApplicationError } from '~/models/utils/Error';

/**
 * Create upload folder if it isn't exist
 */
export function initFolder() {
  [UPLOAD_IMAGES_TEMP_DIR, UPLOAD_VIDEOS_TEMP_DIR].forEach((dir) => {
    // check if folder exist
    if (!fs.existsSync(dir)) {
      // create folder if it isn't existed
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Handle request with image.
 * @param req Request
 * @returns Promise<{fields: Field[], files: File[]}>
 */
export async function handleUploadImage(req: Request) {
  // init formidable instance with custom options
  const form = formidable({
    uploadDir: UPLOAD_IMAGES_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 4,
    maxFields: 4,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: 300 * 1024 * 4, // 300KB * 4
    filter: ({ name, originalFilename, mimetype }) => {
      // keep only images
      const validType = Boolean(mimetype && mimetype.includes('image'));
      if (!validType) {
        form.emit(
          'error' as any,
          new ApplicationError(
            HttpStatus.UNPROCESSABLE_ENTITY,
            CommonMessage.UNPROCESSABLE_ENTITY,
            MediaMessage.INVALID_IMAGE_TYPE
          ) as any
        );
      }

      // have to
      const validProperty = name === 'image';
      if (!validProperty) {
        form.emit(
          'error' as any,
          new ApplicationError(
            HttpStatus.UNPROCESSABLE_ENTITY,
            CommonMessage.UNPROCESSABLE_ENTITY,
            MediaMessage.INVALID_PROPERTY
          ) as any
        );
      }

      return validType && validProperty;
    }
  });

  // pars request with formidable instance
  const result = new Promise<{ fields: Fields; files: Files }>(
    (resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }

        if (!Object.keys(files).length) {
          return reject(
            new ApplicationError(
              HttpStatus.UNPROCESSABLE_ENTITY,
              CommonMessage.UNPROCESSABLE_ENTITY,
              MediaMessage.EMPTY
            )
          );
        }

        resolve({ fields, files });
      });
    }
  );

  return result;
}

/**
 * Get name with without extension from fullname
 * @param nameWithExtension
 * @returns nameWithoutExtension
 */
export function getNameWithoutExtension(nameWithExtension: string): string {
  const arr = nameWithExtension.split('.');
  return arr[0];
}
