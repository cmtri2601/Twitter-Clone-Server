import { createHash } from 'crypto';

/**
 * Create hash string with sha256 algorithm
 * @param str string to hash
 * @param salt variable for salting
 * @return hash string
 */
const sha256 = (str: string, salt?: string): string => {
  return createHash('sha256')
    .update(str + salt)
    .digest('hex');
};

/**
 * Hash string
 * @param str string to hash
 * @return hash string
 */
const hash = (str: string): string => {
  return sha256(str, process.env.HASH_SALT);
};

export default hash;
