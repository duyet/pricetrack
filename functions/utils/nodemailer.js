const nodemailer = require('nodemailer');
const functions = require('firebase-functions')

const gmailEmail = functions.config().pricetrack.gmail_email
const gmailPassword = functions.config().pricetrack.gmail_password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
})

module.exports = mailTransport