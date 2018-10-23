const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next) {
  try {
    let { username, password } = req.body;
    
    if (await User.authenticate(username, password) === true) {
      // create JWT
      let token = jwt.sign({ username }, SECRET_KEY, {
        expiresIn: 60 * 60
      });

      // update last login time
      User.updateLoginTimestamp(username);

      return res.json(token);
    } else {
      let err = new Error("Not Found");
      err.status = 404;
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next) {
  try {
    let { username, password, first_name, last_name, phone } = req.body;

    // register
    let user = await User.register({
      username,
      password,
      first_name,
      last_name,
      phone
    });

    // create JWT
    let token = jwt.sign({ username: user.username }, SECRET_KEY, {
      expiresIn: 60 * 60
    });

    // update last login time
    User.updateLoginTimestamp(user.username);

    return res.json(token);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
