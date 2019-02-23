const {
    httpsFunctions,
    db,
    resError,
    cleanEmail
} = require('../utils')
const { collection: { MESSAGING_TOKEN } } = require('../utils/constants')
const FieldValue = require('firebase-admin').firestore.FieldValue


module.exports = httpsFunctions.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let token = req.query.token
    let email = cleanEmail(req.query.email)

    if (!token || !email) {
        return resError(res, 'Token or email is required')
    }

    db.collection(MESSAGING_TOKEN).doc(email).set({
        email,
        token,
        updated_at: FieldValue.serverTimestamp()
    }).then(() => {
        return res.json({ ok: 1 })
    }).catch(err => {
        return res.status(500).json({err: err.message})
    })
})