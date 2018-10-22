const express = require('express');
const { User } = require('./user');

const router = express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function(req, res, next) {
  try {
    let { username, password, first_name, last_name, phone } = req.body;
    let user = User.register({
      username,
      password,
      first_name,
      last_name,
      phone
    });
    console.log(user);
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
