const nodemailer = require('nodemailer');
const functions = require('firebase-functions')
const { db, formatPrice, hostingUrl } = require('../../utils')

// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().pricetrack.gmail_email
const gmailPassword = functions.config().pricetrack.gmail_password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
})

const APP_NAME = `Pricetrack`
const EMAIL_SUBJECT = `[${APP_NAME}] Sản phẩm vừa thay đổi giá ({PRODUCT_NAME})`

const sendEmail = (email, params) => {
    const mailOptions = {
        from: `${APP_NAME} <pricetrack.apps@gmail.com>`,
        to: email,
    }

    // The user subscribed to the newsletter.
    mailOptions.subject = EMAIL_SUBJECT.replace('{PRODUCT_NAME}', params.info.name)
    mailOptions.html = `Xin chào ${email || ''}
    <br /><br />
    Sản phẩm bạn đang theo dõi vừa thay đổi giá: <br />
    
    <ul>
        <li>Sản phẩm: <a href="${hostingUrl}/view/${params.id}">${params.info.name}</a></li>
        <li>
            Giá cập nhật: ${formatPrice(params.latest_price, false, params.info.currency)} 
            <strong style="color: ${params.price_change < 0 ? '#2e7d32' : '#c62828'}">
                (${formatPrice(params.price_change, true, params.info.currency)})
            </strong>
        </li>

    </ul>
    <br />
    <i>PricetrackBot</i>`;
    
    return mailTransport.sendMail(mailOptions).then(() => {
        return console.log('Email sent to:', email);
    })
}

module.exports = sendEmail