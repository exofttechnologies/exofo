const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for an authenticated user.
 * @param {object} payload  - { id, role }
 * @returns {string} signed token
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT.
 * Throws if invalid or expired.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { signToken, verifyToken };

