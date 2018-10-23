const express = require('express');
const User = require('../models/user');
const Message = require('../models/message');
const db = require('../db');
const sendSMS = require('../sendTwilio');
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth');

const router = express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    let { id } = req.params;

    if (
      (await Message.isFrom(id, req.username)) ||
      (await Message.isTo(id, req.username))
    ) {
      let result = await Message.get(id);
      return res.json(result);
    } else {
      throw new Error('Not authorized');
    }
  } catch (err) {
    next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function(req, res, next) {
  try {
    let from_username = req.username;
    let { to_username, body } = req.body;

    // create object of message data
    let data = { from_username, to_username, body };

    // create message
    let message = await Message.create(data);
    return res.json({ message });
  } catch (err) {
    next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function(req, res, next) {
  try {
    let { id } = req.params;

    // ensure user is authorized to mark message
    if (await Message.isTo(id, req.username)) {
      let message = await Message.markRead(id);
      return res.json({ message });
    } else {
      throw new Error('Not authorized');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/:id/sms', ensureLoggedIn, async function(req, res, next) {
  try {
    // let { to, from } = req.body;
    let { id } = req.params;

    // ensure user is authorized to mark message
    if (await Message.isFrom(id, req.username)) {
      let { body, to, from } = await Message.getSMSData(id);

      let smsResult = await sendSMS(body, to, from);

      return res.json(smsResult);
    } else {
      throw new Error('Not authorized');
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
