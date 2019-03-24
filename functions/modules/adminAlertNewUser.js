const functions = require('firebase-functions')
const mailTransport = require('../utils/nodemailer');
const { email: { APP_NAME, FROM_EMAIL } } = require('../utils/constants')

const ADMIN_EMAIL = functions.config().pricetrack.admin_email || ''

module.exports = functions.auth.user().onCreate(async user => {
    const email = user.email
    const displayName = user.displayName

    const mailOptions = {
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `[${APP_NAME}] New account ${email}`,
        html: `New account is registered: ${displayName} (${email})<br /><br /><pre>${JSON.stringify(user, null, 4)}</pre>`
    }

    try {
        let email = await mailTransport.sendMail(mailOptions)
        console.log('Email sent to:', email)
    } catch (err) {
        console.error(`[New user]: ${JSON.stringify(mailOptions)}`)
    }

    return true
})