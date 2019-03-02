const assert = require('assert')
const {
    httpsFunctions,
    db,
    documentIdFromHashOrUrl,
    collection,
    resError,
    getUserFromToken
} = require('../utils')

const {
    text: {
        ERR_NOT_IS_ADMIN,
        ERR_TOKEN_INVALID
    }
} = require('../utils/constants')

/**
 * HOW TO SET ADMIN
 * 
 * Set admin: Go to firestore add this document: 
 * Path: /admin/<email>/ => { email: <email>, active: true }
 * 
 * TODO: UI to manage admin
 */

module.exports = httpsFunctions.onRequest(async (req, res) => {
    const authUser = await getUserFromToken(req.query.idToken)
    if (authUser === null) return resError(res, ERR_TOKEN_INVALID)

    // Validate is admin in firestore
    let adminUser = null
    try {
        const doc = await db.collection(collection.ADMIN).doc(authUser.email).get()
        assert(doc.exists && doc.get('active') === true)
        adminUser = doc.data()
    } catch (err) {
        console.error(err)
        return resError(res, ERR_NOT_IS_ADMIN)
    }

    let resJson = { adminUser }

    if (req.query.url) {
        const urlSnapshot = await db.collection(collection.URLS)
                                    .doc(documentIdFromHashOrUrl(req.query.url))
                                    .get()
        resJson['url'] = urlSnapshot.data()
    }

    return res.json(resJson)
})