const express = require('express');
const User = require('../models/user');
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth');

const router = express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async function(req, res, next) {
  try {
    let users = await User.all();
    return res.json(users);
  } catch (err) {
    next(err);
  }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, async function(req, res, next) {
  try {
    let { username } = req.params;
    let user = await User.get(username);
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, async function(req, res, next) {
  try {
    let { username } = req.params;
    let messages = await User.messagesTo(username);
    return res.json(messages);
  } catch (err) {
    next(err);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureCorrectUser, async function(req,res,next) {
  try {
    let { username } = req.params;
    let messages = await User.messagesFrom(username);
    return res.json(messages);
  } catch (err) {
    next(err);
  }
});


/** POST /:username/edit - update username, first name, last name, or phone
 * 
 * {user : {username,
 *          first_name,
 *          last_name,
 *          phone }}       =>   {useranme}
 */

router.post('/:username/edit', ensureCorrectUser, async function(req, res, next) {
  try {
    let currentUser = req.params.username;

    let newInfo = { username: req.body.username, 
      first_name: req.body.first_name, 
      last_name: req.body.last_name, 
      phone: req.body.phone };

    let message = await User.updateUserInfo(currentUser, newInfo);
    return res.json(message);
  } catch (err) {
    next(err);
  }
})

module.exports = router;
