/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret';
const BCRYPT_WORK_ROUNDS = 10;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SID = process.env.TWILIO_SID;

module.exports = {
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS
};
