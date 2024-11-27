import jwt, { JwtPayload, PrivateKey, PublicKey, Secret } from 'jsonwebtoken';

/**
 * Transfer callback jwt.sign to promise sign
 * @param payload
 * @param secretOrPrivateKey
 * @param options
 * @returns Promise<string>
 */
export const sign = (
  payload: string | Buffer | object,
  secretOrPrivateKey: Secret | PrivateKey,
  options: jwt.SignOptions = { algorithm: 'HS512' }
): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretOrPrivateKey, options, (error, encoded) => {
      return error ? reject(error) : resolve(encoded);
    });
  });
};

/**
 * Transfer callback jwt.verify to promise verify
 * @param payload
 * @param secretOrPrivateKey
 * @param options
 * @returns Promise<string>
 */
export const verify = (
  payload: string,
  secretOrPrivateKey: Secret | PublicKey,
  options: jwt.SignOptions & { algorithm: 'HS512' }
): Promise<string | JwtPayload | undefined> => {
  return new Promise((resolve, reject) => {
    jwt.verify(payload, secretOrPrivateKey, options, (error, encoded) => {
      return error ? reject(error) : resolve(encoded);
    });
  });
};
