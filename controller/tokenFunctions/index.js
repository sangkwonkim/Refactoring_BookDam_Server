const jwt = require('jsonwebtoken');

module.exports = {
  isAuthorized: (cookie) => {
    try {
      const token = jwt.verify(cookie, process.env.ACCESS_SECRET);
      return token
    } catch (error) {
      throw error
    }
  },
};
