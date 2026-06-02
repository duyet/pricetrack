const nodemailer = require('nodemailer');
const functions = require('firebase-functions/v1')

const gmailEmail = (functions.config().pricetrack || {}).gmail_email
const gmailPassword = (functions.config().pricetrack || {}).gmail_password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
})

module.exports = mailTransport