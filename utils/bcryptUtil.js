const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const PEPPER = process.env.PASSWORD_SECRET_KEY;

/**
 * Hash a plain password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  if (!password) throw new Error('Password is required');

  const combinedPassword = password + PEPPER;
  return await bcrypt.hash(combinedPassword, SALT_ROUNDS);
};

/**
 * Verify password against hash
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) return false;

  const combinedPassword = password + PEPPER;
  return await bcrypt.compare(combinedPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  verifyPassword,
};
