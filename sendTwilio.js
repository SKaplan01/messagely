const { TWILIO_AUTH_TOKEN, TWILIO_SID } = require('./config');

const twilio = require('twilio');
const client = new twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

async function sendSMS(message, to, from) {
  client.messages
    .create({
      body: message,
      to: to, // Text this number
      from: from // From a valid Twilio number
    })
    .then(message => console.log(message.sid))
    .catch(err => {
      throw new Error('SMS messaging unsuccessful');
    });
}

module.exports = sendSMS;
