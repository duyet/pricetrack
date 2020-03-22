const FieldValue = require('firebase-admin').firestore.FieldValue
const {
    httpsFunctions,
    db,
    documentIdFromHashOrUrl,
    collection,
    normalizeUrl
} = require('../utils')
const {
    getProductInfoFromUrl
} = require('../utils/parser/utils')

const { text: { URL_NOT_FOUND } } = require('../utils/constants')

module.exports.onRequest = async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    url = normalizeUrl(url)

    if (!url) {
        return res.status(400).json({
            err: 1,
            msg: URL_NOT_FOUND
        })
    }

    let urlDoc = db.collection(collection.URLS).doc(documentIdFromHashOrUrl(url))
    let info = await getProductInfoFromUrl(url) || null

    // Get URL info
    const snapshot = await urlDoc.get()

    // Not found URL in DB => URL_NOT_FOUND
    if (!snapshot.exists) {
        return res.status(400).json({
            err: 1,
            msg: URL_NOT_FOUND
        })
    }

    if (!info) {
        return res.status(400).json({
            err: 1,
            msg: 'Cannot fetch info'
        })
    }

    // Update info
    let data = snapshot.data()
    info['last_update_at'] = FieldValue.serverTimestamp()

    await urlDoc.set({
        info
    }, {
        merge: true
    })

    data['is_update'] = true
    return res.json({
        id: snapshot.id,
        ...data
    })
}

module.exports.function = httpsFunctions.onRequest(module.exports.onRequest)