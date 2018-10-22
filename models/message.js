/** Message class for message.ly */
const db = require('../db');

/** Message on the site. */

class Message {
  /** register new message -- returns
   *    {id, from_username, to_username, body, sent_at}
   */

  static async create({ from_username, to_username, body }) {
    let result = await db.query(
      `INSERT INTO messages 
      (from_username, to_username, body, sent_at)
      VALUES ($1, $2, $3, LOCALTIMESTAMP)
      RETURNING id, from_username, to_username, body, sent_at`,
      [from_username, to_username, body]
    );
    return result.rows[0];
  }

  /** Update read_at for message */

  static async markRead(id) {
    let result = await db.query(
      `UPDATE messages SET read_at=LOCALTIMESTAMP
      WHERE id=$1
      RETURNING id, read_at`,
      [id]
    );

    return result.rows[0];
  }

  /** Get: get message by id
   *
   * returns {id, from_user, to_user, body, sent_at, read_at}
   *
   * both to_user and from_user = {username, first_name, last_name, phone}
   */

  static async get(id) {
    let result = await db.query(
      `SELECT id, from_username, to_username, body, sent_at, read_at
      FROM messages
      WHERE id=$1`,
      [id]
    );
    return result.rows[0];
  }

  static async getUsersFromMessage(id) {
    let messageUsers = await db.query(
      `
      SELECT to_username, from_username  FROM messages 
      WHERE id=$1`,
      [id]
    );
    return messageUsers.rows[0];
  }

  static async isTo(id, username) {
    let { to_username } = await Message.getUsersFromMessage(id);
    return to_username === username;
  }

  static async isFrom(id, username) {
    let { from_username } = await Message.getUsersFromMessage(id);
    return from_username === username;
  }
}

module.exports = Message;
