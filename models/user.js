/** User class for message.ly */
const bcrypt = require('bcrypt');
const db = require('../db');
const { BCRYPT_WORK_ROUNDS } = require('../config');

/** User of the site. */

class User {
  /** register new user -- returns
   * {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    let hashedPassword = await bcrypt.hash(
      password.toString(),
      BCRYPT_WORK_ROUNDS
    );

    const result = await db.query(
      `INSERT INTO users
      (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, LOCALTIMESTAMP)
      RETURNING username, first_name, last_name, phone, join_at`,
      [username.toLowerCase(), hashedPassword, first_name, last_name, phone]
    );

    result.password = password;

    return result;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username=$1`,
      [username]
    );
    const user = result.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    let result = await db.query(
      `UPDATE users SET last_login_at=LOCALTIMESTAMP
    WHERE username=$1 
    RETURNING username`,
      [username]
    );
    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    let results = await db.query(
      `SELECT username, first_name, last_name
      FROM users`
    );
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    let results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users WHERE username=$1`,
      [username]
    );
    return results.rows[0];
  }

  /** Return messages from this user.
   *
   *
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let results = await db.query(
      `SELECT id, to_username, body, sent_at, read_at 
      FROM messages 
      JOIN users ON users.username=from_username 
      WHERE from_username=$1`,
      [username]
    );
    return results.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    let results = await db.query(
      `SELECT id, from_username, body, sent_at, read_at 
      FROM messages 
      JOIN users ON users.username=to_username 
      WHERE to_username=$1`,
      [username]
    );
    return results.rows;
  }

  /** Update user information.
   * 
   * 
   * Accepts a the currnet user's username,
   * and an object with any or none of these parameters.
   * 
   * 
   * 
   * {username, [first_name, [last_name, [phone]]]} 
   *  => updated {username, first_name, last_name, phone}
   * 
   */

   static async updateUserInfo(username, newInfo) {
     // make sure not to update the database with an undefined value

    let selected = await db.query(
      `SELECT username, first_name, last_name, phone 
      FROM users WHERE username=$1`, [username]
    );

    let userInfo = selected.rows[0];

    for (let key in newInfo) {
      userInfo[key] = newInfo[key] || userInfo[key];
    }

    let updated = await db.query(
      `UPDATE users 
      SET username=$1, first_name=$2, last_name=$3, phone=$4
      WHERE username=$5
      RETURNING username,first_name,last_name,phone`,
      [userInfo.username, 
      userInfo.first_name, 
      userInfo.last_name, 
      userInfo.phone, 
      username]
    );

    return updated.rows[0];
   }
}

module.exports = User;
