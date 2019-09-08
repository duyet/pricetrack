const {
    httpsFunctions,
    db,
    hash,
    collection,
    getUserFromToken,
    resError
} = require('../utils')

const {
    text: {
        ERR_EMAIL_REQUIRED,
        ERR_EMAIL_NOT_FOUND
    }
} = require('../utils/constants')

const getSubByEmail = async (url, email) => {
    let urlDoc = db.collection(collection.URLS)
                    .doc(hash(url))
                    .collection(collection.SUBSCRIBE)
                    .doc(email)

    let snapshot = null
    snapshot = await urlDoc.get()
    if (!snapshot.exists) throw Error(ERR_EMAIL_NOT_FOUND)
    let data = snapshot.data()
    return data
}

module.exports = httpsFunctions.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url

    const authUser = await getUserFromToken(req.query.idToken)
    if (authUser === null) return resError(res, ERR_EMAIL_REQUIRED)
    const email = authUser.email
    const hashUrl = hash(url)

    if (req.method == 'GET' && url && email) {
        try {
            const emails = await getSubByEmail(url, email)
            return res.json(emails)
        } catch (err) {
            return resError(res, err.message, 404)
        }
    } else if (req.method == 'POST') {
        // TODO: validate google token
        if (req.body && typeof req.body == typeof {}) {
            const keys = ['expect_price', 'active', 'methods', 'expect_when', 'email', 'created_at']
            let updated = {}
            for (let key of keys) {
                if (req.body[key] !== undefined) {
                    updated[key] = req.body[key]
                }
            }
            if (Object.keys(updated).length) {
                console.info(`Update subscibe ${hashUrl}/${url} BODY: ${JSON.stringify(updated)}`)
                try {
                    const updateSnapshot = await db.collection(collection.URLS)
                        .doc(hashUrl)
                        .collection(collection.SUBSCRIBE)
                        .doc(email)
                        .set(updated, { merge: true })
                    console.log(updateSnapshot)
                    return res.json(updateSnapshot)
                } catch (err) {
                    return resError(res, '' + err)
                }
            }
        }
    }

    return resError(res)
})